import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Target } from "lucide-react";

const exercises = [
  {
    id: 1,
    name: "Push-ups",
    category: "Upper Body",
    duration: "10-15 reps",
    difficulty: "Beginner",
    calories: 50,
    description: "Classic bodyweight exercise for chest, shoulders, and triceps",
    instructions: [
      "Start in a plank position with hands shoulder-width apart",
      "Lower your body until chest nearly touches the floor",
      "Push back up to starting position",
      "Keep your core tight throughout the movement"
    ]
  },
  {
    id: 2,
    name: "Squats",
    category: "Lower Body",
    duration: "15-20 reps",
    difficulty: "Beginner",
    calories: 60,
    description: "Fundamental exercise for legs and glutes",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending knees and hips",
      "Keep your chest up and knees behind toes",
      "Push through heels to return to standing"
    ]
  },
  {
    id: 3,
    name: "Plank",
    category: "Core",
    duration: "30-60 seconds",
    difficulty: "Beginner",
    calories: 40,
    description: "Core strengthening exercise",
    instructions: [
      "Start in a push-up position on forearms",
      "Keep your body in a straight line",
      "Engage your core and hold the position",
      "Breathe steadily throughout"
    ]
  },
  {
    id: 4,
    name: "Lunges",
    category: "Lower Body",
    duration: "10-12 reps per leg",
    difficulty: "Intermediate",
    calories: 70,
    description: "Single-leg exercise for balance and strength",
    instructions: [
      "Step forward with one leg",
      "Lower your hips until both knees are at 90 degrees",
      "Push back to starting position",
      "Alternate legs"
    ]
  },
  {
    id: 5,
    name: "Mountain Climbers",
    category: "Cardio",
    duration: "30-45 seconds",
    difficulty: "Intermediate",
    calories: 80,
    description: "High-intensity cardio and core exercise",
    instructions: [
      "Start in a plank position",
      "Bring one knee toward your chest",
      "Quickly switch legs in a running motion",
      "Keep your core engaged and hips level"
    ]
  },
  {
    id: 6,
    name: "Burpees",
    category: "Full Body",
    duration: "8-12 reps",
    difficulty: "Advanced",
    calories: 100,
    description: "Full-body conditioning exercise",
    instructions: [
      "Start standing, drop into a squat",
      "Place hands on floor and jump feet back to plank",
      "Do a push-up, then jump feet back to squat",
      "Explosively jump up with arms overhead"
    ]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "Intermediate":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "Advanced":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export const Exercise = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold">Home Exercises</h2>
      </div>
      
      <p className="text-muted-foreground">
        Balance your diet with these simple home exercises. No equipment needed!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription>{exercise.category}</CardDescription>
                </div>
                <Badge variant="secondary" className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
              
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>~{exercise.calories} cal</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Instructions:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  {exercise.instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Exercise Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Always warm up for 5-10 minutes before exercising</p>
          <p>• Focus on proper form over speed or repetitions</p>
          <p>• Rest for 30-60 seconds between exercises</p>
          <p>• Stay hydrated throughout your workout</p>
          <p>• Listen to your body and don't push through pain</p>
          <p>• Aim for at least 3-4 workout sessions per week</p>
        </CardContent>
      </Card>
    </div>
  );
};
