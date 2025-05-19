import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormState {
  password: string;
  confirmPassword: string;
  errors: {
    password?: string;
    confirmPassword?: string;
    submit?: string;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
}

export function ResetPasswordForm() {
  const [formState, setFormState] = useState<FormState>({
    password: "",
    confirmPassword: "",
    errors: {},
    isSubmitting: false,
    isSuccess: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: undefined,
      },
    }));
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Hasło jest wymagane";
    }
    if (password.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków";
    }
    if (!/[A-Z]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną wielką literę";
    }
    if (!/[a-z]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną małą literę";
    }
    if (!/[0-9]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną cyfrę";
    }
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
      return "Potwierdzenie hasła jest wymagane";
    }
    if (password !== confirmPassword) {
      return "Hasła nie są identyczne";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(formState.password);
    const confirmPasswordError = validateConfirmPassword(formState.password, formState.confirmPassword);

    if (passwordError || confirmPasswordError) {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          password: passwordError,
          confirmPassword: confirmPasswordError,
        },
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: formState.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas resetowania hasła");
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
          <CardTitle className="text-2xl font-bold text-center">Hasło zostało zmienione</CardTitle>
          <CardDescription className="text-center">Możesz teraz zalogować się używając nowego hasła.</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col pt-6">
          <Button type="button" className="w-full font-medium" onClick={() => (window.location.href = "/auth/login")}>
            Przejdź do logowania
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center">Resetowanie hasła</CardTitle>
        <CardDescription className="text-center">Wprowadź i potwierdź nowe hasło</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {formState.errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{formState.errors.submit}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formState.password}
              onChange={handleInputChange}
              disabled={formState.isSubmitting}
              className={formState.errors.password ? "border-destructive" : ""}
            />
            {formState.errors.password && <p className="text-sm text-destructive">{formState.errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={handleInputChange}
              disabled={formState.isSubmitting}
              className={formState.errors.confirmPassword ? "border-destructive" : ""}
            />
            {formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{formState.errors.confirmPassword}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-6">
          <Button type="submit" className="w-full font-medium" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Resetowanie hasła..." : "Zresetuj hasło"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
