import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function PasswordRecoveryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const validateField = (value: string): string => {
    if (!value.trim()) {
      return "To pole jest wymagane";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Nieprawidłowy format adresu email";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const error = validateField(email);
    if (error) {
      setErrors({ email: error });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas wysyłania instrukcji");
      }

      setIsSubmitted(true);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription className="text-center">
            Wysłaliśmy instrukcje resetowania hasła na podany adres email. Sprawdź swoją skrzynkę i postępuj zgodnie z
            instrukcjami.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-6 pb-6">
          <a href="/auth/login" className="text-primary hover:underline font-medium">
            Powrót do strony logowania
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center">Odzyskiwanie hasła</CardTitle>
        <CardDescription className="text-center">
          Podaj swój adres email, a wyślemy Ci instrukcje resetowania hasła
        </CardDescription>
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
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
              }}
              onBlur={(e) => {
                const error = validateField(e.target.value);
                if (error) {
                  setErrors({ email: error });
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
        </CardContent>
        <CardFooter className="flex flex-col pt-6 pb-6">
          <Button type="submit" className="w-full font-medium mb-6" size="lg" disabled={isLoading}>
            {isLoading ? "Wysyłanie..." : "Wyślij instrukcje"}
          </Button>
          <div className="text-sm text-center">
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Powrót do strony logowania
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
