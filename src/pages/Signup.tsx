import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-16 bg-hack-background">
      <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-lg shadow-lg mt-8">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">Create an Account</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#4CAF50",
                  brandAccent: "#45a049",
                },
              },
            },
          }}
          theme="dark"
          providers={[]}
          view="sign_up"
        />
      </div>
    </div>
  );
};

export default Signup;