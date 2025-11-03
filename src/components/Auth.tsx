import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Phone, Mail } from "lucide-react";
import { z } from "zod";
import { logAuditEvent } from "@/lib/auditLog";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const phoneSchema = z.string()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in international format (e.g., +1234567890)");

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  const validateInputs = (): boolean => {
    try {
      if (authMethod === "email") {
        emailSchema.parse(email);
        passwordSchema.parse(password);
      } else {
        phoneSchema.parse(phone);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success("Verification code sent to your phone!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      await logAuditEvent('phone_signup_completed', 'auth', undefined);
      toast.success("Phone verified! Welcome!");
    } catch (error: any) {
      if (error.message?.includes("Token has expired")) {
        toast.error("Verification code expired. Please request a new one.");
        setOtpSent(false);
        setOtp("");
      } else {
        toast.error(error.message || "Failed to verify code");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success("Verification code sent to your phone!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created! You can now sign in.");
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
    } catch (error: any) {
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            Diet Tracker
          </CardTitle>
          <CardDescription className="text-center">
            Your personal AI-powered nutrition companion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={authMethod === "email" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAuthMethod("email");
                  setOtpSent(false);
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={authMethod === "phone" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAuthMethod("phone");
                  setOtpSent(false);
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </Button>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {authMethod === "email" ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : otpSent ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-otp">Verification Code</Label>
                    <Input
                      id="signin-otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to {phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                    >
                      Change Number
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePhoneSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-phone">Phone Number</Label>
                    <Input
                      id="signin-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              {authMethod === "email" ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              ) : otpSent ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">Verification Code</Label>
                    <Input
                      id="signup-otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to {phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                    >
                      Change Number
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Sign Up"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePhoneSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name-phone">Full Name</Label>
                    <Input
                      id="signup-name-phone"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US, +44 for UK)
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
