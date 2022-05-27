import React from "react";
import "./gym.css";
import Topbar from "../../components/topbar/topbar";
import Footer from "../../components/footer/footer";

export default function Gym() {
    return (
        <>
            <Topbar/>
            <div className="text-table">
                    <p> <pre>| Day | Exercise                        | Muscle                    | Reps       | Sets            | Weight (kg) |</pre> </p>
                    <p> <pre>|-----|---------------------------------|---------------------------|------------|-----------------|-------------|</pre> </p>
                    <p> <pre>|  1  | Twisting Bicep Curl             | Bicep                     | 8-10       | 3               | 7.5         |</pre> </p>
                    <p> <pre>|     | Barbell Bench Press             | Chest                     | 8-10       | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Chest Fly (Dual Cable)          | Chest                     | 10-12      | 3               | 5           |</pre> </p>
                    <p> <pre>|     | Seated Dumbbell Shoulder Press  | Shoulders                 | 10-12      | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Banded Push-ups                 | Chest                     | To Failure | n/a             | n/a         |</pre> </p>
                    <p> <pre>|     | Lateral Raises                  | Shoulders                 | 8-10       | 3               | 3           |</pre> </p>
                    <p> <pre>|     | Single Leg Squat                | Quads, Glutes, Hamstrings | 5          | 5               | n/a         |</pre> </p>
                    <p> <pre>|     | Side Plank Hold                 | Core                      | 30s        | 1 on each side  | n/a         |</pre> </p>
                    <p> <pre>|     | Incline Bench Sit Ups           | Core                      | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Plank                           | Core                      | 60s        | 1-3             | n/a         |</pre> </p>
                    <p> <pre>|  2  | Twisting Bicep Curl             | Bicep                     | 8-10       | 3               | 7.5         |</pre> </p>
                    <p> <pre>|     | Tricep Pushdowns                | Triceps                   | 10-12      | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Barbell Squat                   | Quads, Glutes, Hamstrings | 5          | 5               | 40          |</pre> </p>
                    <p> <pre>|     | Standing Calf Raise             | Calfs                     | 10         | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Leg Extensions                  | Quads, Glutes, Hamstrings | 10-12      | 3               | 35          |</pre> </p>
                    <p> <pre>|     | Single Leg Squat                | Quads, Glutes, Hamstrings | 5          | 5               | n/a         |</pre> </p>
                    <p> <pre>|     | Skull Crushers (Dumbbells)      | Triceps                   | 8-10       | 3               | 10          |</pre> </p>
                    <p> <pre>|     | Incline Bench Sit Ups           | Core                      | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Plank                           | Core                      | 60s        | 1-3             | n/a         |</pre> </p>
                    <p> <pre>|  3  | Twisting Bicep Curl             | Bicep                     | 8-10       | 3               | 7.5         |</pre> </p>
                    <p> <pre>|     | Neutral Lat Pulldown (Widegrip) | Back                      | 8-10       | 3               | 35          |</pre> </p>
                    <p> <pre>|     | Seated Cable Row                | Back                      | 8-10       | 3               | 35          |</pre> </p>
                    <p> <pre>|     | Pulldowns                       | Back                      | 8-10       | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Jackknife Pullups               | Back                      | 12-15      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Dumbbell Shrugs                 | Trapezius (Upper Traps)   | 10-12      | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Incline Bench Sit Ups           | Core                      | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Plank                           | Core                      | 60s        | 1-3             | n/a         |</pre> </p>
                    <p> <pre>|  4  | Twisting Bicep Curl             | Bicep                     | 8-10       | 3               | 7.5         |</pre> </p>
                    <p> <pre>|     | Tricep Dips                     | Triceps                   | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Standing Calf Raise             | Calfs                     | 10         | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Overhead Triceps Extension      | Triceps                   | 10-12      | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Preacher Curls                  | Biceps                    | 8-10       | 3               | 10          |</pre> </p>
                    <p> <pre>|     | Incline Bench Sit Ups           | Core                      | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Plank                           | Core                      | 60s        | 1-3             | n/a         |</pre> </p>
                    <p> <pre>|  5  | Rest Day (Drink lots of water)  |                           |            |                 |             |</pre> </p>
                    <p> <pre>|  6  | Twisting Bicep Curl             | Bicep                     | 8-10       | 3               | 7.5         |</pre> </p>
                    <p> <pre>|     | Seated Dumbbell Shoulder Press  | Shoulders                 | 10-12      | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Barbell Bench Press             | Chest                     | 8-10       | 3               | 12.5        |</pre> </p>
                    <p> <pre>|     | Chest Fly (Dual Cable)          | Chest                     | 10-12      | 3               | 5           |</pre> </p>
                    <p> <pre>|     | Side Lateral to Front Raise     | Shoulders                 | 10-12      | 3               | 5           |</pre> </p>
                    <p> <pre>|     | Single Leg Squat                | Quads, Glutes, Hamstrings | 5          | 5               | n/a         |</pre> </p>
                    <p> <pre>|     | Seated Bent-Over Lateral Raise  | Shoulders                 | 10-12      | 3               | 3           |</pre> </p>
                    <p> <pre>|     | Incline Bench Sit Ups           | Core                      | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Plank                           | Core                      | 60s        | 1-3             | n/a         |</pre> </p>
                    <p> <pre>|  7  | Twisting Bicep Curl             | Bicep                     | 8-10       | 3               | 7.5         |</pre> </p>
                    <p> <pre>|     | Seated Cable Row                | Back                      | 8-10       | 3               | 35          |</pre> </p>
                    <p> <pre>|     | Dumbbell Bent-over Rows         | Bicep/Back                | 8-10       | 3 for each side | 10          |</pre> </p>
                    <p> <pre>|     | Deadlift                        | Back                      | 5          | 1               | 60          |</pre> </p>
                    <p> <pre>|     | Preacher Curls                  | Biceps                    | 8-10       | 3               | 10          |</pre> </p>
                    <p> <pre>|     | Neutral Lat Pulldown (Widegrip) | Back                      | 8-10       | 3               | 35          |</pre> </p>
                    <p> <pre>|     | Incline Bench Sit Ups           | Core                      | 10-12      | 3               | n/a         |</pre> </p>
                    <p> <pre>|     | Plank                           | Core                      | 60s        | 1-3             | n/a         |</pre> </p>
                    <p> <pre>|-----|---------------------------------|---------------------------|------------|-----------------|-------------|</pre> </p>
            </div>
            <Footer/>
        </>
    );
}
