import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Target, Flame, Play, X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// TypeScript declaration for Lottie player
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': any;
    }
  }
}

// Load Lottie player
if (typeof window !== 'undefined') {
  import('@lottiefiles/lottie-player');
}

const exercises = [
  {
    id: 1,
    name: "Push-ups",
    category: "Upper Body",
    duration: "10-15 reps",
    difficulty: "Beginner",
    calories: 50,
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    description: "Classic bodyweight exercise for chest, shoulders, and triceps",
    benefits: "Builds upper body strength, improves core stability, and enhances posture",
    instructions: [
      "Start in a plank position with hands shoulder-width apart",
      "Lower your body until chest nearly touches the floor",
      "Push back up to starting position",
      "Keep your core tight throughout the movement"
    ],
    animation: "push-up"
  },
  {
    id: 2,
    name: "Squats",
    category: "Lower Body",
    duration: "15-20 reps",
    difficulty: "Beginner",
    calories: 60,
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    description: "Fundamental exercise for legs and glutes",
    benefits: "Strengthens lower body, improves mobility, and boosts metabolism",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending knees and hips",
      "Keep your chest up and knees behind toes",
      "Push through heels to return to standing"
    ],
    animation: "squat"
  },
  {
    id: 3,
    name: "Plank",
    category: "Core",
    duration: "30-60 seconds",
    difficulty: "Beginner",
    calories: 40,
    targetMuscles: ["Abs", "Core", "Back"],
    description: "Core strengthening exercise",
    benefits: "Builds core strength, improves posture, and reduces back pain",
    instructions: [
      "Start in a push-up position on forearms",
      "Keep your body in a straight line",
      "Engage your core and hold the position",
      "Breathe steadily throughout"
    ],
    animation: "plank"
  },
  {
    id: 4,
    name: "Lunges",
    category: "Lower Body",
    duration: "10-12 reps per leg",
    difficulty: "Intermediate",
    calories: 70,
    targetMuscles: ["Quads", "Glutes", "Calves"],
    description: "Single-leg exercise for balance and strength",
    benefits: "Improves balance, builds leg strength, and enhances coordination",
    instructions: [
      "Step forward with one leg",
      "Lower your hips until both knees are at 90 degrees",
      "Push back to starting position",
      "Alternate legs"
    ],
    animation: "lunge"
  },
  {
    id: 5,
    name: "Mountain Climbers",
    category: "Cardio",
    duration: "30-45 seconds",
    difficulty: "Intermediate",
    calories: 80,
    targetMuscles: ["Core", "Shoulders", "Legs"],
    description: "High-intensity cardio and core exercise",
    benefits: "Increases heart rate, burns calories, and improves cardiovascular fitness",
    instructions: [
      "Start in a plank position",
      "Bring one knee toward your chest",
      "Quickly switch legs in a running motion",
      "Keep your core engaged and hips level"
    ],
    animation: "mountain-climber"
  },
  {
    id: 6,
    name: "Burpees",
    category: "Full Body",
    duration: "8-12 reps",
    difficulty: "Advanced",
    calories: 100,
    targetMuscles: ["Full Body", "Cardio"],
    description: "Full-body conditioning exercise",
    benefits: "Maximum calorie burn, builds total body strength, and improves endurance",
    instructions: [
      "Start standing, drop into a squat",
      "Place hands on floor and jump feet back to plank",
      "Do a push-up, then jump feet back to squat",
      "Explosively jump up with arms overhead"
    ],
    animation: "burpee"
  },
  {
    id: 7,
    name: "Jumping Jacks",
    category: "Cardio",
    duration: "30-60 seconds",
    difficulty: "Beginner",
    calories: 45,
    targetMuscles: ["Full Body", "Cardio"],
    description: "Classic warm-up and cardio exercise",
    benefits: "Increases heart rate, improves coordination, and warms up the body",
    instructions: [
      "Start standing with feet together, arms at sides",
      "Jump while spreading legs and raising arms overhead",
      "Jump back to starting position",
      "Maintain a steady rhythm"
    ],
    animation: "jumping-jack"
  },
  {
    id: 8,
    name: "High Knees",
    category: "Cardio",
    duration: "30-45 seconds",
    difficulty: "Intermediate",
    calories: 75,
    targetMuscles: ["Legs", "Core", "Cardio"],
    description: "Running in place with high knee lifts",
    benefits: "Improves running form, burns calories, and strengthens hip flexors",
    instructions: [
      "Stand with feet hip-width apart",
      "Run in place, bringing knees up to hip level",
      "Pump arms in running motion",
      "Keep your core engaged and posture upright"
    ],
    animation: "high-knee"
  },
  {
    id: 9,
    name: "Bicycle Crunches",
    category: "Core",
    duration: "15-20 reps per side",
    difficulty: "Intermediate",
    calories: 55,
    targetMuscles: ["Abs", "Obliques"],
    description: "Dynamic ab exercise targeting obliques",
    benefits: "Tones abs, strengthens obliques, and improves rotational strength",
    instructions: [
      "Lie on your back with hands behind head",
      "Bring opposite elbow to opposite knee",
      "Extend other leg straight",
      "Alternate sides in a pedaling motion"
    ],
    animation: "bicycle-crunch"
  },
  {
    id: 10,
    name: "Wall Sit",
    category: "Lower Body",
    duration: "30-60 seconds",
    difficulty: "Beginner",
    calories: 35,
    targetMuscles: ["Quads", "Glutes"],
    description: "Isometric leg strengthening exercise",
    benefits: "Builds leg endurance, strengthens quads, and improves stability",
    instructions: [
      "Stand with back against a wall",
      "Slide down until knees are at 90 degrees",
      "Keep back flat against wall",
      "Hold position, keeping weight in heels"
    ],
    animation: "wall-sit"
  },
  {
    id: 11,
    name: "Tricep Dips",
    category: "Upper Body",
    duration: "10-15 reps",
    difficulty: "Intermediate",
    calories: 50,
    targetMuscles: ["Triceps", "Shoulders"],
    description: "Bodyweight exercise for triceps using a chair or bench",
    benefits: "Builds arm strength, tones triceps, and improves pushing power",
    instructions: [
      "Sit on edge of chair, hands gripping edge",
      "Slide forward off chair, supporting with arms",
      "Lower body by bending elbows to 90 degrees",
      "Push back up to starting position"
    ],
    animation: "tricep-dip"
  },
  {
    id: 12,
    name: "Russian Twists",
    category: "Core",
    duration: "20-30 reps",
    difficulty: "Intermediate",
    calories: 60,
    targetMuscles: ["Obliques", "Core"],
    description: "Rotational core exercise",
    benefits: "Strengthens obliques, improves rotational power, and enhances core stability",
    instructions: [
      "Sit with knees bent, feet off floor",
      "Lean back slightly, keeping back straight",
      "Twist torso side to side",
      "Touch floor beside hip with each twist"
    ],
    animation: "russian-twist"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "Intermediate":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "Advanced":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Upper Body":
      return "💪";
    case "Lower Body":
      return "🦵";
    case "Core":
      return "🎯";
    case "Cardio":
      return "❤️";
    case "Full Body":
      return "🔥";
    default:
      return "🏃";
  }
};

const ExerciseAnimation = ({ animation, name }: { animation: string; name: string }) => {
  // Map animation names to asset filenames
  const assetMap: Record<string, string> = {
    'jumping-jack': 'jumping-jacks',
    'squat': 'squat',
    'push-up': 'push-up',
    'plank': 'plank',
    'lunge': 'lunges',
    'mountain-climber': 'mountain-climbers',
    'burpee': 'burpees',
    'high-knee': 'high-knees',
    'bicycle-crunch': 'bicycle-crunches',
    'wall-sit': 'wall-sit',
    'tricep-dip': 'tricep-dips',
    'russian-twist': 'russian-twists'
  };

  const assetName = assetMap[animation] || animation;
  const hasAsset = ['jumping-jacks', 'squat', 'dumbbell-curl', 'treadmill', 'hula-hoop'].includes(assetName);

  if (hasAsset) {
    return (
      <figure 
        className="fit-illust fit-illust--md" 
        role="img" 
        aria-label={`${name} exercise animation`}
      >
        <img 
          className="anim-src" 
          src={`/assets/exercises/${assetName}.webp`} 
          alt={`${name} animation`} 
          width="320" 
          height="320"
        />
        <img 
          className="still-src" 
          src={`/assets/exercises/${assetName}-still.png`} 
          alt={`${name} still`} 
          width="320" 
          height="320"
        />
      </figure>
    );
  }

  // SVG fallback for exercises without assets
  const getIllustration = () => {
    const baseClasses = "absolute inset-0 flex items-center justify-center";
    
    switch (animation) {
      case "push-up":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <path d="M60 120 L140 120 M100 80 L100 160" className="stroke" strokeWidth="4" strokeLinecap="round" />
              <circle cx="100" cy="80" r="15" className="top" />
              <rect x="85" y="100" width="30" height="50" rx="5" className="bottom" />
            </svg>
          </div>
        );
      case "plank":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <line x1="50" y1="110" x2="150" y2="110" className="stroke" strokeWidth="6" strokeLinecap="round" />
              <circle cx="60" cy="110" r="8" className="top" />
              <circle cx="140" cy="110" r="8" className="top" />
              <rect x="75" y="80" width="50" height="30" rx="8" className="bottom" />
            </svg>
          </div>
        );
      case "lunge":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <circle cx="100" cy="50" r="16" className="top" />
              <path d="M100 66 L100 110 M100 110 L70 160 M100 110 L130 140" className="stroke" strokeWidth="4" strokeLinecap="round" />
              <circle cx="70" cy="160" r="6" className="accent" />
            </svg>
          </div>
        );
      case "mountain-climber":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <path d="M50 100 L100 60 L150 100" className="stroke" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="100" cy="60" r="12" className="top" />
              <path d="M85 120 L115 120" className="bottom" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "burpee":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <circle cx="100" cy="70" r="15" className="top" />
              <path d="M100 85 L100 125 M100 125 L75 155 M100 125 L125 155" className="stroke" strokeWidth="4" strokeLinecap="round" />
              <path d="M100 100 L70 115 M100 100 L130 115" className="bottom" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "high-knee":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <circle cx="100" cy="60" r="16" className="top" />
              <path d="M100 76 L100 115 M100 115 L85 160 M100 115 L115 100" className="stroke" strokeWidth="4" strokeLinecap="round" />
              <circle cx="115" cy="100" r="8" className="accent" />
            </svg>
          </div>
        );
      case "bicycle-crunch":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <circle cx="100" cy="80" r="14" className="top" />
              <ellipse cx="100" cy="120" rx="35" ry="25" className="bottom" opacity="0.7" />
              <path d="M85 105 L70 135 M115 105 L130 135" className="stroke" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "wall-sit":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <rect x="140" y="40" width="8" height="120" className="equip" opacity="0.4" />
              <circle cx="100" cy="70" r="15" className="top" />
              <path d="M100 85 L100 115 M100 115 L75 115 M100 115 L125 115 M75 115 L75 145 M125 115 L125 145" className="stroke" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "tricep-dip":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <rect x="60" y="95" width="80" height="8" rx="4" className="equip" opacity="0.5" />
              <circle cx="100" cy="70" r="14" className="top" />
              <path d="M100 84 L100 110 M85 95 L75 110 M115 95 L125 110" className="stroke" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "russian-twist":
        return (
          <div className={baseClasses}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" className="blob" />
              <circle cx="100" cy="85" r="14" className="top" />
              <ellipse cx="100" cy="115" rx="40" ry="20" className="bottom" opacity="0.6" />
              <path d="M100 100 L65 110 M100 100 L135 110" className="stroke" strokeWidth="4" strokeLinecap="round" />
              <circle cx="65" cy="110" r="6" className="accent" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <figure 
      className="fit-illust fit-illust--md fit-illust--framed w-full" 
      role="img" 
      aria-label={`${name} exercise illustration`}
    >
      <div className="relative w-full aspect-square">
        {getIllustration()}
      </div>
    </figure>
  );
};

export const Exercise = () => {
  const [selectedExercise, setSelectedExercise] = useState<typeof exercises[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Upper Body", "Lower Body", "Core", "Cardio", "Full Body"];
  
  const filteredExercises = filterCategory === "All" 
    ? exercises 
    : exercises.filter(e => e.category === filterCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Home Exercises</h2>
            <p className="text-sm text-muted-foreground">Balance your diet with effective workouts</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(category)}
              className="transition-all"
            >
              {category !== "All" && <span className="mr-1">{getCategoryIcon(category)}</span>}
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card 
            key={exercise.id} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-center mb-3">
                <ExerciseAnimation animation={exercise.animation} name={exercise.name} />
              </div>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {exercise.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <span>{getCategoryIcon(exercise.category)}</span>
                    {exercise.category}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
              
              <div className="flex gap-3 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 bg-accent/50 px-2 py-1 rounded-md">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-accent/50 px-2 py-1 rounded-md">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-medium">~{exercise.calories} cal</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-1 flex-wrap">
                  {exercise.targetMuscles.slice(0, 2).map((muscle, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                  {exercise.targetMuscles.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{exercise.targetMuscles.length - 2}
                    </Badge>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise Tips */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Pro Exercise Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Always warm up for 5-10 minutes before exercising</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Focus on proper form over speed or repetitions</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Rest for 30-60 seconds between exercises</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Stay hydrated throughout your workout</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Listen to your body and don't push through pain</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Aim for at least 3-4 workout sessions per week</span>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getCategoryIcon(selectedExercise.category)}</span>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedExercise.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedExercise.category}</p>
                  </div>
                  <Badge variant="secondary" className={getDifficultyColor(selectedExercise.difficulty)}>
                    {selectedExercise.difficulty}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Animation */}
                <ExerciseAnimation animation={selectedExercise.animation} name={selectedExercise.name} />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="font-semibold">{selectedExercise.duration}</p>
                  </div>
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Calories</span>
                    </div>
                    <p className="font-semibold">~{selectedExercise.calories} cal</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About This Exercise</h3>
                  <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <p className="text-sm text-muted-foreground">{selectedExercise.benefits}</p>
                </div>

                {/* Target Muscles */}
                <div>
                  <h3 className="font-semibold mb-2">Target Muscles</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedExercise.targetMuscles.map((muscle, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Step-by-Step Instructions</h3>
                  <ol className="space-y-3">
                    {selectedExercise.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-muted-foreground pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <Button onClick={() => setSelectedExercise(null)} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};