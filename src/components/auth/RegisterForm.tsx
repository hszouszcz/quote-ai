import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: RegisterFormData) => ({ ...prev, [name]: value }));
    setErrors((prev: Record<string, string>) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: string): string => {
    const result = registerSchema.safeParse({ ...formData, [name]: value });
    if (!result.success) {
      const fieldError = result.error.errors.find((error) => error.path[0] === name);
      return fieldError?.message || "";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas rejestracji");
      }

      if (data.needsEmailConfirmation) {
        setSuccess(true);
        setFormData({ email: "", password: "", confirmPassword: "" });
      } else {
        window.location.href = "/auth/login?registered=true";
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription className="text-center">
            Na Twój adres email wysłaliśmy link aktywacyjny. Kliknij w niego, aby potwierdzić rejestrację.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col pt-6 pb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full font-medium"
            size="lg"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Wróć do logowania
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center">Rejestracja</CardTitle>
        <CardDescription className="text-center">
          Utwórz nowe konto aby rozpocząć korzystanie z aplikacji
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-2">
          {errors.form && (
            <Alert variant="destructive">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Potwierdź hasło
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={(e) => {
                const error = validateField("confirmPassword", e.target.value);
                if (error) {
                  setErrors((prev) => ({ ...prev, confirmPassword: error }));
                }
              }}
              className={errors.confirmPassword ? "border-destructive" : ""}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              disabled={isLoading}
            />
            <div className="min-h-[20px]">
              {errors.confirmPassword && (
                <p className="text-sm text-destructive" id="confirmPassword-error" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-6 pb-6">
          <Button type="submit" className="w-full font-medium mb-6" size="lg" disabled={isLoading}>
            {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
          </Button>
          <div className="text-sm text-center">
            <span className="text-muted-foreground">Masz już konto? </span>
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Zaloguj się
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
