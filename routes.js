const { register, login, getWorkout, getTopRatedWorkouts, postschedule, getschedule, deleteschedule } = require("./handler");

const routes = [
  {
    method: "POST",
    path: "/register",
    handler: register,
  },
  {
    method: "GET",
    path: "/login",
    handler: login,
  },
  /*{
    method: "GET",
    path: "/getCategory",
  },*/
  {
    method: "GET",
    path: "/getWorkout",
    handler: getWorkout,
  },
  {
    method: "GET",
    path: "/getTopRatedWorkouts",
    handler: getTopRatedWorkouts,
  },
  {
    method: "POST",
    path: "/schedule",
    handler: postschedule,
  },
  {
    method: "GET",
    path: "/schedule",
    handler: getschedule,
  },
  {
    method: "DELETE",
    path: "/schedule/{eventId}",
    handler: deleteschedule,
  },
];

module.exports = routes;
