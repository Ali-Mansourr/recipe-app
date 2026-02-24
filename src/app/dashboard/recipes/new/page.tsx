import { RecipeForm } from "@/components/recipe-form";

export default function NewRecipePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Recipe</h1>
        <p className="text-muted-foreground">Add a new recipe to your collection</p>
      </div>
      <RecipeForm />
    </div>
  );
}
