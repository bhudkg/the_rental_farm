import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUploader from '../../components/ImageUploader';
import LocationPicker from '../../components/LocationPicker';
import OwnerOnboardingForm from '../../components/OwnerOnboardingForm';
import { createTree } from '../../services/api';
import useStore from '../../store/useStore';

const TYPES = ['mango', 'banana', 'orange', 'lemon', 'coconut', 'guava', 'grapes', 'apple', 'papaya', 'pomegranate', 'jackfruit', 'chiku'];
const SIZES = ['Small (1-2 ft)', 'Medium (3-4 ft)', 'Large (5-6 ft)', 'Extra Large (7-8 ft)'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir', 'Delhi',
];

const MIN_IMAGES = 2;

const STEPS = [
  { key: 'images', label: 'Photos', icon: CameraIcon },
  { key: 'basic', label: 'Basic Info', icon: TreeIcon },
  { key: 'location', label: 'Location', icon: MapPinIcon },
  { key: 'pricing', label: 'Pricing', icon: CurrencyIcon },
  { key: 'details', label: 'Details', icon: ClipboardIcon },
];

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function TreeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-6m0 0c-3.5 0-6-2.5-6-6 0-2.5 1.5-4.5 3-5.5C10 2.5 11 2 12 2s2 .5 3 1.5c1.5 1 3 3 3 5.5 0 3.5-2.5 6-6 6z" />
    </svg>
  );
}

function MapPinIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function CurrencyIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

export default function AddTree() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const [onboardingDone, setOnboardingDone] = useState(!!user?.has_owner_profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');

  if (!onboardingDone) {
    return <OwnerOnboardingForm onComplete={() => setOnboardingDone(true)} />;
  }

  const [form, setForm] = useState({
    name: '',
    type: 'mango',
    variety: '',
    description: '',
    location: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    min_quantity: 1,
    price_per_season: '',
    season_start: '',
    season_end: '',
    size: 'Medium (3-4 ft)',
    age: '',
    previous_year_yield: '',
    image_urls: [],
  });

  const completedSteps = useMemo(() => ({
    images: form.image_urls.length >= MIN_IMAGES,
    basic: !!form.name && !!form.type,
    location: !!form.city && !!form.state,
    pricing: !!form.price_per_season && !!form.season_start && !!form.season_end,
    details: !!form.min_quantity,
  }), [form]);

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLocationChange = useCallback(({ latitude, longitude }) => {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  }, []);

  const handleAddressChange = useCallback(({ city, state, area }) => {
    setForm((prev) => ({
      ...prev,
      city: city || prev.city,
      state: state || prev.state,
      location: area || prev.location,
    }));
  }, []);

  const validateStep = (stepIndex) => {
    const stepKey = STEPS[stepIndex].key;
    switch (stepKey) {
      case 'images':
        if (form.image_urls.length < MIN_IMAGES) {
          setError(`Please upload at least ${MIN_IMAGES} photos before continuing.`);
          return false;
        }
        break;
      case 'basic':
        if (!form.name.trim()) {
          setError('Please enter a tree name.');
          return false;
        }
        if (!form.type) {
          setError('Please select a fruit type.');
          return false;
        }
        break;
      case 'location':
        if (!form.city.trim()) {
          setError('Please enter the city.');
          return false;
        }
        if (!form.state) {
          setError('Please select the state.');
          return false;
        }
        break;
      case 'pricing':
        if (!form.season_start) {
          setError('Please select a season start month.');
          return false;
        }
        if (!form.season_end) {
          setError('Please select a season end month.');
          return false;
        }
        if (!form.price_per_season) {
          setError('Please enter the price per season.');
          return false;
        }
        break;
      default:
        break;
    }
    setError(null);
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setSlideDirection('right');
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setError(null);
    setSlideDirection('left');
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (index) => {
    if (index < currentStep) {
      setError(null);
      setSlideDirection('left');
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    for (let i = currentStep; i < index; i++) {
      if (!validateStep(i)) return;
    }
    setSlideDirection('right');
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.image_urls.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images of your tree.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        variety: form.variety || null,
        description: form.description || null,
        location: form.location || null,
        city: form.city || null,
        state: form.state || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        min_quantity: parseInt(form.min_quantity, 10),
        price_per_season: form.price_per_season ? parseFloat(form.price_per_season) : null,
        season_start: form.season_start ? parseInt(form.season_start, 10) : null,
        season_end: form.season_end ? parseInt(form.season_end, 10) : null,
        size: form.size,
        age: form.age ? parseInt(form.age, 10) : null,
        previous_year_yield: form.previous_year_yield ? parseFloat(form.previous_year_yield) : null,
        image_urls: form.image_urls,
        image_url: form.image_urls[0] || null,
      };
      const tree = await createTree(payload);
      navigate(`/owner/trees/${tree.id}/qr`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create tree');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all duration-150';
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5';
  const selectClass = `${inputClass} bg-white appearance-none cursor-pointer`;

  const stepContent = {
    images: (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Upload at least {MIN_IMAGES} clear photos. The first image will be the cover.</p>
        <ImageUploader
          value={form.image_urls}
          onChange={(updater) =>
            setForm((prev) => ({
              ...prev,
              image_urls: typeof updater === 'function' ? updater(prev.image_urls) : updater,
            }))
          }
          minCount={MIN_IMAGES}
        />
      </div>
    ),
    basic: (
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Tree Name <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. Alphonso Mango Tree"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fruit Type <span className="text-red-400">*</span></label>
            <select value={form.type} onChange={update('type')} className={selectClass}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Variety</label>
            <input
              type="text"
              value={form.variety}
              onChange={update('variety')}
              placeholder="e.g. Alphonso (Hapus)"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Tell renters about your tree — age, health, expected yield..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    ),
    location: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Local Area</label>
            <input
              type="text"
              value={form.location}
              onChange={update('location')}
              placeholder="Farm / Area name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.city}
              onChange={update('city')}
              placeholder="Nearest city"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State <span className="text-red-400">*</span></label>
            <select value={form.state} onChange={update('state')} className={selectClass}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <LocationPicker
          city={form.city}
          state={form.state}
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={handleLocationChange}
          onAddressChange={handleAddressChange}
        />
      </div>
    ),
    pricing: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Season Start <span className="text-red-400">*</span></label>
            <select value={form.season_start} onChange={update('season_start')} className={selectClass}>
              <option value="">Select month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Season End <span className="text-red-400">*</span></label>
            <select value={form.season_end} onChange={update('season_end')} className={selectClass}>
              <option value="">Select month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {form.season_start && form.season_end && (
          <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="text-gray-600">
              Season: <span className="font-semibold text-gray-800">{MONTHS[form.season_start - 1]}</span>
              {' '}&rarr;{' '}
              <span className="font-semibold text-gray-800">{MONTHS[form.season_end - 1]}</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price per Season <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                value={form.price_per_season}
                onChange={update('price_per_season')}
                placeholder="4,500"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Price with Delivery</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-sm font-semibold text-emerald-700">
                {form.price_per_season
                  ? `₹${(parseFloat(form.price_per_season) + 1000).toLocaleString('en-IN')}`
                  : '—'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Season price + ₹1,000 delivery</p>
          </div>
        </div>
      </div>
    ),
    details: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Age of Tree (years)</label>
            <input
              type="number"
              min="0"
              value={form.age}
              onChange={update('age')}
              placeholder="e.g. 12"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Previous Year Yield (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.previous_year_yield}
              onChange={update('previous_year_yield')}
              placeholder="e.g. 120"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Yield Guarantee (kg/season)</label>
            <input
              type="number"
              min="1"
              value={form.min_quantity}
              onChange={update('min_quantity')}
              placeholder="e.g. 50"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Size</label>
            <select value={form.size} onChange={update('size')} className={selectClass}>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    ),
  };

  const activeStep = STEPS[currentStep];
  const ActiveIcon = activeStep.icon;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header banner */}
      <div className="bg-linear-to-r from-primary to-emerald-600 px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/owner/trees"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to my trees
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Add New Tree</h1>
          <p className="text-sm text-white/70">List your tree for rent in a few simple steps.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-4 sm:p-5">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-xs font-bold text-primary">{completedCount}/{STEPS.length} completed</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-linear-to-r from-primary to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Clickable step pills */}
          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((step, i) => {
              const done = completedSteps[step.key];
              const active = i === currentStep;
              const StepIcon = step.icon;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => goToStep(i)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : done
                        ? 'bg-primary/10 text-primary hover:bg-primary/15'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {done && !active ? (
                    <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="hidden sm:inline truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active step content */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          key={currentStep}
          className={`animate-fade-slide-${slideDirection}`}
        >
          <div className={`bg-white rounded-2xl border transition-all duration-200 ${completedSteps[activeStep.key] ? 'border-primary/30 shadow-sm shadow-primary/5' : 'border-gray-200 shadow-sm'}`}>
            {/* Section header */}
            <div className="flex items-center gap-3.5 px-5 py-4 border-b border-gray-100">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${completedSteps[activeStep.key] ? 'bg-primary/10' : 'bg-gray-100'} transition-colors`}>
                {completedSteps[activeStep.key]
                  ? <CheckCircleIcon className="w-5 h-5 text-primary" />
                  : <ActiveIcon className="w-5 h-5 text-gray-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Step {currentStep + 1}</span>
                  {completedSteps[activeStep.key] && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Done</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {activeStep.key === 'images' && 'Tree Photos'}
                  {activeStep.key === 'basic' && 'Basic Information'}
                  {activeStep.key === 'location' && 'Location'}
                  {activeStep.key === 'pricing' && 'Season & Pricing'}
                  {activeStep.key === 'details' && 'Additional Details'}
                </h3>
              </div>
            </div>

            {/* Section body */}
            <div className="px-5 py-5">
              {stepContent[activeStep.key]}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mt-5">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 pt-6 pb-8">
          {isFirstStep ? (
            <Link
              to="/owner/trees"
              className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium text-center hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          <div className="flex-1" />

          {isLastStep ? (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-105 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  List My Tree
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-105 transition-all"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Slide animation styles */}
      <style>{`
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-slide-right { animation: fadeSlideRight 0.3s ease-out; }
        .animate-fade-slide-left { animation: fadeSlideLeft 0.3s ease-out; }
      `}</style>
    </div>
  );
}
