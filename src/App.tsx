import React, { useState } from 'react';
import { Send, Loader2, Salad, Camera, Globe2, MessageSquare, Heart } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('language', selectedLanguage);
    
    try {
      const result = await fetch("http://localhost:6001/analyze_food", {
        method: "POST",
        body: formData
      });

      const data = await result.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error analyzing the image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    setShowFeedbackSuccess(true);
    setFeedback('');
    setTimeout(() => setShowFeedbackSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Salad className="w-12 h-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">SavourSAGE</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Where <span className="text-green-600 font-semibold">Savour</span> meets service and{' '}
            <span className="text-green-600 font-semibold">SAGE</span> brings healing through intelligent nutrition analysis
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe2 className="w-5 h-5 mr-2" />
                Select Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Upload Food Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
                <div className="space-y-1 text-center">
                  <div className="flex flex-col items-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mb-4 max-h-48 rounded-lg"
                      />
                    ) : (
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedImage}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Analyze Food
                </>
              )}
            </button>
          </form>

          {/* Response Section */}
          {response && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Calorie Analysis Results</h2>
              <div className="bg-green-50 rounded-lg p-4 whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-green-600" />
            Reach Out to Us
          </h2>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Share your thoughts or suggestions
              </label>
              <textarea
                id="feedback"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="We'd love to hear from you..."
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Heart className="w-5 h-5 mr-2" />
              Send Feedback
            </button>
          </form>
          {showFeedbackSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              Thank you for your feedback! We appreciate your input.
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500">
          <p className="mb-2">SavourSAGE - Your Intelligent Nutrition Guide</p>
          <p>Powered by AI - Results may vary. Please consult with healthcare professionals for accurate nutritional advice.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;