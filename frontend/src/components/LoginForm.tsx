import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const startGoogle = () => {
    const redirect = encodeURIComponent('http://localhost:8080/oauth/callback');
    window.location.href = `http://localhost:3000/api/auth/google/start?redirect=${redirect}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
        
      navigate('/'); // Navigate to landing page after successful login
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid credentials",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Login to Order</h2>
        <p className="text-muted-foreground text-center">Enter your credentials to continue</p>
      </div>
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full bg-[#FF4B3E] hover:bg-[#FF6B5E]">
          Login
        </Button>
        <div className="text-center text-sm text-muted-foreground">or</div>
        <Button type="button" variant="outline" className="w-full" onClick={startGoogle}>
          Continue with Google
        </Button>
      </div>
    </form>
  );
};
