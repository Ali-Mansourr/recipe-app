import Link from "next/link";
import { ChefHat, Sparkles, Users, Search, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">RecipeVault</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your Recipes,{" "}
            <span className="text-primary">Reimagined</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Organize your favorite recipes, discover new ones with AI, and share
            your culinary creations with friends and family.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Cooking
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your recipes
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-primary" />}
              title="Organize Recipes"
              description="Add, edit, and organize recipes with ingredients, instructions, and metadata. Tag them as favorites or mark ones to try."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-primary" />}
              title="AI-Powered"
              description="Generate recipes from ingredients, get smart substitutions, auto-detect cuisine types, and get meal plan suggestions."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Share & Collaborate"
              description="Share recipes with other users, control permissions, and discover public recipes from the community."
            />
            <FeatureCard
              icon={<Search className="h-10 w-10 text-primary" />}
              title="Smart Search"
              description="Find recipes by name, ingredient, cuisine type, or preparation time. Filter and sort to find exactly what you need."
            />
            <FeatureCard
              icon={<Heart className="h-10 w-10 text-primary" />}
              title="Status Tracking"
              description="Mark recipes as favorites, things to try, or dishes you've already made. Keep track of your culinary journey."
            />
            <FeatureCard
              icon={<ChefHat className="h-10 w-10 text-primary" />}
              title="Beautiful Interface"
              description="A modern, responsive design with dark mode support that looks great on any device."
            />
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>RecipeVault &mdash; Built with Next.js, Prisma, and AI</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
