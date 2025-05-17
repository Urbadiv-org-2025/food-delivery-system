// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Link } from 'react-router-dom';
// import { useNavigate } from "react-router-dom";
// import { ArrowRight, Utensils, MapPin, Clock, ShieldCheck, Menu, X } from 'lucide-react';

// const LandingPage = () => {
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };
//   // Inside your Home component:
// const navigate = useNavigate();
  
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
//       {/* Navigation */}
//       <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex-shrink-0 flex items-center">
//               <span className="text-xl font-bold text-[#FF4B3E]">Foodie Pal</span>
//             </div>
            
//             <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
//               <Link to="/login" className="px-3 py-2 text-gray-700 hover:text-[#FF4B3E] transition-colors">
//                 Sign In
//               </Link>
//               <Link to="/login">
//                 <Button className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white">
//                   Get Started
//                 </Button>
//               </Link>
//             </div>
            
//             <div className="flex items-center md:hidden">
//               <button 
//                 onClick={toggleMobileMenu}
//                 className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#FF4B3E] focus:outline-none"
//               >
//                 {isMobileMenuOpen ? (
//                   <X className="h-6 w-6" />
//                 ) : (
//                   <Menu className="h-6 w-6" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Mobile menu */}
//         <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
//             <Link 
//               to="/login" 
//               className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF4B3E]"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Sign In
//             </Link>
//             <Link 
//               to="/login" 
//               className="block px-3 py-2 text-base font-medium"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               <Button className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white w-full">
//                 Get Started
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden pt-16">
//         <div className="absolute inset-0 bg-gradient-to-r from-[#FF4B3E]/5 to-[#FF6B5E]/5 z-0"></div>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
//           <div className="flex flex-col lg:flex-row items-center">
//             <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
//               <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
//                 <span className="text-[#FF4B3E]">Fast</span> & <span className="text-[#FF4B3E]">Delicious</span> Food Delivered
//               </h1>
//               <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
//                 Order your favorite meals from local restaurants and get them delivered to your door in minutes.
//               </p>
//               <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
//                 <Link to="/login">
//                   <Button className="w-full sm:w-auto bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
//                     Get Started <ArrowRight className="ml-2 h-5 w-5" />
//                   </Button>
//                 </Link>
//                 <Button 
//                   variant="outline" 
//                   className="w-full sm:w-auto px-8 py-6 text-lg rounded-full border-2 hover:bg-gray-50"
//                   onClick={() => setIsVideoPlaying(true)}
//                 >
//                   How It Works
//                 </Button>
//               </div>
//             </div>
//             <div className="lg:w-1/2 transform hover:scale-105 transition-transform duration-500">
//               <img 
//                 src="/food-delivery.svg" 
//                 alt="Food Delivery Illustration" 
//                 className="max-w-full h-auto drop-shadow-2xl animate-fade-in"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "https://placehold.co/600x400?text=Foodie+Pal&font=montserrat";
//                 }}
//               />
//             </div>
//           </div>
//         </div>
        
//         {isVideoPlaying && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setIsVideoPlaying(false)}>
//             <div className="w-full max-w-3xl p-4" onClick={e => e.stopPropagation()}>
//               <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <p className="text-white text-center p-4">Video would play here in production app</p>
//                   <button 
//                     className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
//                     onClick={() => setIsVideoPlaying(false)}
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How Foodie Pal Works</h2>
//             <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
//               Our simple 3-step process makes food ordering quick and convenient
//             </p>
//           </div>

//           {/* Add a grid container for the three steps */}
//           <div className="grid md:grid-cols-3 gap-8 mt-12">
//             <div
//               onClick={() => navigate("/restaurants/explore")}
//               className="cursor-pointer bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300"
//             >
//               <div className="inline-flex items-center justify-center p-4 bg-[#FF4B3E]/10 rounded-full mb-6">
//                 <Utensils className="h-10 w-10 text-[#FF4B3E]" />
//               </div>
//               <h3 className="text-2xl font-semibold mb-4">Select Restaurant</h3>
//               <p className="text-gray-600">
//                 Browse through our curated list of restaurants and find your favorite foods.
//               </p>
//             </div>    

//             <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300">
//               <div className="inline-flex items-center justify-center p-4 bg-[#FF4B3E]/10 rounded-full mb-6">
//                 <MapPin className="h-10 w-10 text-[#FF4B3E]" />
//               </div>
//               <h3 className="text-2xl font-semibold mb-4">Set Location</h3>
//               <p className="text-gray-600">Easily set your delivery location using our interactive map.</p>
//             </div>
            
//             <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300">
//               <div className="inline-flex items-center justify-center p-4 bg-[#FF4B3E]/10 rounded-full mb-6">
//                 <Clock className="h-10 w-10 text-[#FF4B3E]" />
//               </div>
//               <h3 className="text-2xl font-semibold mb-4">Track Order</h3>
//               <p className="text-gray-600">Real-time tracking of your order from confirmation to delivery.</p>
//             </div>
//           </div>
//         </div>
//       </section>
      
//       {/* Testimonials Section */}
//       <section className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
//             <p className="mt-4 text-lg text-gray-600">Trusted by thousands of food lovers across the city</p>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 name: "Sarah L.", 
//                 role: "Regular Customer",
//                 quote: "Foodie Pal has changed how I order food. The app is so intuitive and delivery is always on time!",
//                 image: "https://randomuser.me/api/portraits/women/44.jpg"
//               },
//               {
//                 name: "Mike T.", 
//                 role: "Food Enthusiast",
//                 quote: "The real-time tracking is fantastic. I always know when my food will arrive, and the selection is amazing.",
//                 image: "https://randomuser.me/api/portraits/men/32.jpg"
//               },
//               {
//                 name: "Jessica R.", 
//                 role: "Busy Professional",
//                 quote: "As someone with a hectic schedule, Foodie Pal has been a lifesaver. Quick, reliable, and great customer service.",
//                 image: "https://randomuser.me/api/portraits/women/68.jpg"
//               }
//             ].map((testimonial, index) => (
//               <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
//                 <div className="flex flex-col h-full">
//                   <div className="flex-grow">
//                     <p className="italic text-gray-600 mb-6">"{testimonial.quote}"</p>
//                   </div>
//                   <div className="mt-4 flex items-center">
//                     <img 
//                       src={testimonial.image} 
//                       alt={testimonial.name} 
//                       className="h-12 w-12 rounded-full mr-4 object-cover"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = `https://ui-avatars.com/api/?name=${testimonial.name}&background=random`;
//                       }}
//                     />
//                     <div>
//                       <p className="font-semibold text-gray-900">{testimonial.name}</p>
//                       <p className="text-sm text-gray-500">{testimonial.role}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
      
//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B5E] text-white">
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Order Your Favorite Food?</h2>
//           <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">Join thousands of happy customers who use Foodie Pal every day to satisfy their cravings.</p>
//           <Link to="/login">
//             <Button className="bg-white text-[#FF4B3E] hover:bg-gray-100 px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
//               Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
//             </Button>
//           </Link>
//         </div>
//       </section>
      
//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
//             <div>
//               <h3 className="text-2xl font-bold mb-6">Foodie Pal</h3>
//               <p className="text-gray-400 mb-6">Connecting hungry customers with the best restaurants in town since 2023.</p>
//               <div className="flex space-x-4">
//                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                   <span className="sr-only">Facebook</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
//                   </svg>
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                   <span className="sr-only">Instagram</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
//                   </svg>
//                 </a>
//                 <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                   <span className="sr-only">Twitter</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//                     <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//             <div>
//               <h4 className="text-lg font-medium mb-6">Company</h4>
//               <ul className="space-y-4">
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-lg font-medium mb-6">Legal</h4>
//               <ul className="space-y-4">
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Compliance</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-lg font-medium mb-6">Support</h4>
//               <ul className="space-y-4">
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Center</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Guidelines</a></li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
//             <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Foodie Pal. All rights reserved.</p>
//             <div className="mt-4 sm:mt-0">
//               <p className="text-gray-400 text-sm">Made with ❤️ for hungry customers</p>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate,Navigate } from 'react-router-dom';
import { ArrowRight, Utensils, MapPin, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const LandingPage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Get user and logout from useAuth
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false); // Close mobile menu on sign out
  };

  if (!user) return <Navigate to="/app" replace />;

  if (user!==null && user.role !== "customer") {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }


  return (
    
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-[#FF4B3E]">Foodie Pal</span>
            </div>

            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-[#FF4B3E] transition-colors"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                  <Link to="/restaurants/explore">
                    <Button className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white">
                      Start Ordering
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-gray-700 hover:text-[#FF4B3E] transition-colors">
                    Sign In
                  </Link>
                  <Link to="/login">
                    <Button className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#FF4B3E] focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF4B3E]"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
                <Link
                  to="/restaurants/explore"
                  className="block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white w-full">
                    Start Ordering
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF4B3E]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4B3E]/5 to-[#FF6B5E]/5 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                <span className="text-[#FF4B3E]">Fast</span> & <span className="text-[#FF4B3E]">Delicious</span> Food Delivered
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Order your favorite meals from local restaurants and get them delivered to your door in minutes.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to={user ? "/restaurants/explore" : "/login"}>
                  <Button className="w-full sm:w-auto bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                    {user ? "Start Ordering" : "Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg rounded-full border-2 hover:bg-gray-50"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  How It Works
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 transform hover:scale-105 transition-transform duration-500">
              <img
                src="/food-delivery.svg"
                alt="Food Delivery Illustration"
                className="max-w-full h-auto drop-shadow-2xl animate-fade-in"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400?text=Foodie+Pal&font=montserrat";
                }}
              />
            </div>
          </div>
        </div>

        {isVideoPlaying && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setIsVideoPlaying(false)}>
            <div className="w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-center p-4">Video would play here in production app</p>
                  <button
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                    onClick={() => setIsVideoPlaying(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How Foodie Pal Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our simple 3-step process makes food ordering quick and convenient
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div
              onClick={() => navigate("/restaurants/explore")}
              className="cursor-pointer bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300"
            >
              <div className="inline-flex items-center justify-center p-4 bg-[#FF4B3E]/10 rounded-full mb-6">
                <Utensils className="h-10 w-10 text-[#FF4B3E]" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Select Restaurant</h3>
              <p className="text-gray-600">
                Browse through our curated list of restaurants and find your favorite foods.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-[#FF4B3E]/10 rounded-full mb-6">
                <MapPin className="h-10 w-10 text-[#FF4B3E]" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Set Location</h3>
              <p className="text-gray-600">Easily set your delivery location using our interactive map.</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300">
              <div className="inline-flex items-center justify-center p-4 bg-[#FF4B3E]/10 rounded-full mb-6">
                <Clock className="h-10 w-10 text-[#FF4B3E]" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Track Order</h3>
              <p className="text-gray-600">Real-time tracking of your order from confirmation to delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-gray-600">Trusted by thousands of food lovers across the city</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah L.",
                role: "Regular Customer",
                quote: "Foodie Pal has changed how I order food. The app is so intuitive and delivery is always on time!",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
              },
              {
                name: "Mike T.",
                role: "Food Enthusiast",
                quote: "The real-time tracking is fantastic. I always know when my food will arrive, and the selection is amazing.",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                name: "Jessica R.",
                role: "Busy Professional",
                quote: "As someone with a hectic schedule, Foodie Pal has been a lifesaver. Quick, reliable, and great customer service.",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <p className="italic text-gray-600 mb-6">"{testimonial.quote}"</p>
                  </div>
                  <div className="mt-4 flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full mr-4 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${testimonial.name}&background=random`;
                      }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FF4B3E] to-[#FF6B5E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Order Your Favorite Food?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">
            Join thousands of happy customers who use Foodie Pal every day to satisfy their cravings.
          </p>
          <Link to={user ? "/restaurants/explore" : "/login"}>
            <Button className="bg-white text-[#FF4B3E] hover:bg-gray-100 px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
              {user ? "Start Ordering" : "Get Started Now"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Foodie Pal</h3>
              <p className="text-gray-400 mb-6">Connecting hungry customers with the best restaurants in town since 2023.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08天下午c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Foodie Pal. All rights reserved.</p>
            <div className="mt-4 sm:mt-0">
              <p className="text-gray-400 text-sm">Made with ❤️ for hungry customers</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;