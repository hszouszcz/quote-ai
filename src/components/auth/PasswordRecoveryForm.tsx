import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PasswordRecoveryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form submission will be implemented later
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription>
            Wysłaliśmy instrukcje resetowania hasła na podany adres email. Sprawdź swoją skrzynkę i postępuj zgodnie z
            instrukcjami.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <a href="/auth/login" className="text-primary hover:underline">
            Powrót do strony logowania
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Odzyskiwanie hasła</CardTitle>
        <CardDescription>Podaj swój adres email, a wyślemy Ci instrukcje resetowania hasła</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="twoj@email.com" required disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Wysyłanie..." : "Wyślij instrukcje"}
          </Button>
          <div className="text-sm text-center">
            <a href="/auth/login" className="text-primary hover:underline">
              Powrót do strony logowania
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
