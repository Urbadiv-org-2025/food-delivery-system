export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Handle script load success
    window.initMap = () => {
      resolve();
    };

    // Handle script load failure
    script.onerror = () => {
      reject(new Error("Google Maps failed to load"));
    };

    // Add script to document
    document.head.appendChild(script);
  });
};