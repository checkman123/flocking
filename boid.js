/*
flocking rules:
1) Separation - steer to avoid crowding local flockmates
2) Alignment  - steer towards the avg heading of local flockmates
3) Cohesion   - steer to move toward the avg position of local flockmates
*/

class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D(); //create random velocity vector
    this.velocity.setMag(random(2, 4)); //moving with a slight velocity (setMag = set magnitude) aka Speed
    this.acceleration = createVector();
    this.MaxForce = 0.2;
    this.MaxSpeed = 3;
    this.r = 3; //triangle size
  }

  edges() {
    //once it reach the edge of screen, appear on the other side
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  align(boids) {
    //align this boid to other boids
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity); //add all other boids velocity
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); //divide with the numbers of other boids
      steering.setMag(this.MaxSpeed); //set Speed
      steering.sub(this.velocity);
      steering.limit(this.MaxForce); //how fast it is turning to avg direction
    }
    return steering;
  }

  cohesion(boids) {
    //steer to move toward the avg position of local flockmates
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perceptionRadius) {
        steering.add(other.position); //add all other boids position
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); //divide with the numbers of other boids
      steering.sub(this.position); //subtract position
      steering.setMag(this.MaxSpeed); //set Speed
      steering.sub(this.velocity);
      steering.limit(this.MaxForce); //how fast it is turning to avg direction
    }
    return steering;
  }

  separation(boids) {
    //steer to avoid crowding local flockmates
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(Math.pow(d, 2)); //the further away, the lower the magnitude
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); //divide with the numbers of other boids
      steering.setMag(this.MaxSpeed); //set Speed
      steering.sub(this.velocity);
      steering.limit(this.MaxForce); //how fast it is turning to avg direction
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    //this.acceleration = alignment;
    //this.acceleration = cohesion;

    separation.mult(separationSlider.value());
    cohesion.mult(cohesionSlider.value());
    alignment.mult(alignSlider.value());

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  //Make it move
  update() {
    this.position.add(this.velocity); //position is update based on boid velocity
    this.velocity.add(this.acceleration); //velocity is update based on boid acceleration
    this.velocity.limit(this.MaxSpeed);
    this.acceleration.set(0, 0); //or this.acceleration.mult(0);
  }

  show() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + radians(90);
    fill(127);
    stroke(200);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }
}
