import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormState {
  email: string;
  errors: {
    email?: string;
    submit?: string;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
}

export function PasswordRecoveryForm() {
  const [formState, setFormState] = useState<FormState>({
    email: "",
    errors: {},
    isSubmitting: false,
    isSuccess: false,
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      email: e.target.value,
      errors: {
        ...prev.errors,
        email: undefined,
      },
    }));
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email jest wymagany";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Nieprawidłowy format adresu email";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(formState.email);
    if (emailError) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, email: emailError },
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formState.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas wysyłania linku resetującego hasło");
      }

      setFormState((prev) => ({
        ...prev,
        isSuccess: true,
        errors: {},
      }));
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          submit: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
        },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  if (formState.isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription className="text-center">
            Wysłaliśmy link do resetowania hasła na adres {formState.email}. Kliknij w niego, aby zresetować hasło.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col pt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full font-medium"
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
        <CardTitle className="text-2xl font-bold text-center">Odzyskiwanie hasła</CardTitle>
        <CardDescription className="text-center">
          Podaj swój adres email, a wyślemy Ci link do resetowania hasła
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {formState.errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{formState.errors.submit}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={handleEmailChange}
              placeholder="twoj@email.com"
              disabled={formState.isSubmitting}
              className={formState.errors.email ? "border-destructive" : ""}
            />
            {formState.errors.email && <p className="text-sm text-destructive">{formState.errors.email}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-6">
          <Button type="submit" className="w-full font-medium mb-4" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
          </Button>
          <div className="text-sm text-center">
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Wróć do logowania
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
