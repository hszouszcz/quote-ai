import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { LoginFormData } from "@/lib/schemas/auth";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being changed
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return "To pole jest wymagane";
    }
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Nieprawidłowy format adresu email";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate all fields first
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas logowania");
      }

      window.location.href = "/quotes";
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center">Logowanie</CardTitle>
        <CardDescription className="text-center">Zaloguj się do swojego konta aby kontynuować</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-6">
          {errors.form && (
            <p className="text-sm font-medium text-destructive text-center" role="alert">
              {errors.form}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={(e) => {
                const error = validateField("email", e.target.value);
                if (error) {
                  setErrors((prev) => ({ ...prev, email: error }));
                }
              }}
              placeholder="twoj@email.com"
              className={errors.email ? "border-destructive" : ""}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isLoading}
            />
            <div className="min-h-[20px]">
              {errors.email && (
                <p className="text-sm text-destructive" id="email-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Hasło
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={(e) => {
                const error = validateField("password", e.target.value);
                if (error) {
                  setErrors((prev) => ({ ...prev, password: error }));
                }
              }}
              className={errors.password ? "border-destructive" : ""}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={isLoading}
            />
            <div className="min-h-[20px]">
              {errors.password && (
                <p className="text-sm text-destructive" id="password-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-6 pb-6">
          <Button type="submit" className="w-full font-medium mb-6" size="lg" disabled={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
          <div className="text-sm text-center space-x-1">
            <a href="/auth/register" className="text-primary hover:underline font-medium">
              Zarejestruj się
            </a>
            <span className="text-muted-foreground">lub</span>
            <a href="/auth/recover-password" className="text-primary hover:underline font-medium">
              Przypomnij hasło
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
