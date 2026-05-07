// Production deploy pipeline.
//
// Triggered by GitHub webhook → Jenkins multibranch scan picks up the new
// commit on `main` and runs this file. The companion GitHub Actions workflow
// (.github/workflows/deploy.yml) builds the images and pushes them to GHCR.
// We poll for those images here before deploying.
//
// Required Jenkins credentials:
//   ghcr-pat       Username/password — GitHub username + GHCR read PAT
//   trf-prod-env   Secret file       — full backend/.env for production
//
// Required Jenkins env (configure → global properties):
//   APP_DIR         /opt/the-rental-farm
//   GHCR_REPO       ghcr.io/<owner>/<repo>   (lowercase)
//   DOMAIN          your-sub.duckdns.org

pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        TAG          = "${env.GIT_COMMIT}"
        APP_DIR      = "${env.APP_DIR ?: '/opt/the-rental-farm'}"
        COMPOSE_FILE = "${env.APP_DIR ?: '/opt/the-rental-farm'}/docker-compose.prod.yml"
    }

    stages {
        stage('Sync repo to APP_DIR') {
            steps {
                sh '''
                    set -euo pipefail
                    install -d "$APP_DIR"
                    rsync -a --delete \
                        --exclude='.git' --exclude='backups' \
                        ./ "$APP_DIR/"
                '''
            }
        }

        stage('Render env file') {
            steps {
                withCredentials([file(credentialsId: 'trf-prod-env', variable: 'ENVFILE')]) {
                    sh '''
                        set -euo pipefail
                        install -m 600 "$ENVFILE" "$APP_DIR/backend/.env"
                    '''
                }
            }
        }

        stage('Wait for GHCR images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ghcr-pat',
                                                  usernameVariable: 'GH_USER',
                                                  passwordVariable: 'GH_TOKEN')]) {
                    sh '''
                        set -euo pipefail
                        echo "$GH_TOKEN" | docker login ghcr.io -u "$GH_USER" --password-stdin

                        for img in backend frontend; do
                            ref="${GHCR_REPO}/${img}:${TAG}"
                            echo "Waiting for $ref ..."
                            for i in $(seq 1 60); do
                                if docker manifest inspect "$ref" >/dev/null 2>&1; then
                                    echo "  found after ${i} attempt(s)"
                                    break
                                fi
                                if [ "$i" = "60" ]; then
                                    echo "  giving up after 10 minutes" >&2
                                    exit 1
                                fi
                                sleep 10
                            done
                            docker pull "$ref"
                        done
                    '''
                }
            }
        }

        stage('Backup database') {
            steps {
                sh '"$APP_DIR/scripts/backup-db.sh"'
            }
        }

        stage('Bring up database') {
            // Idempotent: ensures postgres is running on the trf_net network
            // before we attempt migrations. Safe on first deploy too.
            steps {
                sh '''
                    set -euo pipefail
                    cd "$APP_DIR"
                    GHCR_REPO="$GHCR_REPO" TAG="$TAG" \
                        docker compose -f docker-compose.prod.yml up -d postgres
                    # Wait for healthcheck
                    for i in $(seq 1 30); do
                        status=$(docker inspect -f '{{.State.Health.Status}}' trf_postgres 2>/dev/null || echo unknown)
                        [ "$status" = "healthy" ] && break
                        sleep 2
                    done
                    [ "$status" = "healthy" ] || { echo "postgres not healthy"; exit 1; }
                '''
            }
        }

        stage('Run migrations') {
            steps {
                sh '''
                    set -euo pipefail
                    cd "$APP_DIR"
                    set -a; . ./backend/.env; set +a
                    docker run --rm \
                        --network trf_net \
                        --env-file ./backend/.env \
                        -e DATABASE_URL="postgresql://${POSTGRES_USER:-rental_farm_user}:${POSTGRES_PASSWORD:-rental_farm_pass}@trf_postgres:5432/${POSTGRES_DB:-the_rental_farm}" \
                        --entrypoint alembic \
                        "${GHCR_REPO}/backend:${TAG}" \
                        upgrade head
                '''
            }
        }

        stage('Approve production deploy') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input message: "Deploy ${TAG.take(7)} to ${env.DOMAIN}?", ok: 'Deploy'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -euo pipefail
                    cd "$APP_DIR"

                    # Save current tag for rollback BEFORE swapping
                    if [ -f CURRENT_TAG ]; then
                        cp CURRENT_TAG PREVIOUS_TAG
                    fi
                    echo "$TAG" > CURRENT_TAG

                    GHCR_REPO="$GHCR_REPO" TAG="$TAG" \
                        docker compose -f docker-compose.prod.yml up -d --remove-orphans
                '''
            }
        }

        stage('Smoke test') {
            steps {
                sh '"$APP_DIR/scripts/smoke-test.sh"'
            }
        }
    }

    post {
        failure {
            script {
                // Roll back if Deploy or Smoke test failed and we have a previous tag.
                sh '''
                    set -euo pipefail
                    cd "$APP_DIR"
                    if [ -f PREVIOUS_TAG ]; then
                        PREV="$(cat PREVIOUS_TAG)"
                        echo "Rolling back to $PREV"
                        GHCR_REPO="$GHCR_REPO" TAG="$PREV" \
                            docker compose -f docker-compose.prod.yml up -d --remove-orphans
                        cp PREVIOUS_TAG CURRENT_TAG
                    else
                        echo "No PREVIOUS_TAG — first deploy, nothing to roll back to."
                    fi
                '''
            }
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
