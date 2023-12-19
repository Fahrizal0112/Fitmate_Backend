const {
  getExercise,
  getExerciseByEquipment,
  getExerciseByQuery,
  getDetailExercise,
  getMuscle,
  getCategory,
  getTopRatedExercise,
} = require("./handler");

const routes = [
  {
    method: "GET",
    path: "/getExercise",
    handler: getExercise,
  },
  {
    method: "GET",
    path: "/getExerciseByEquipment",
    handler: getExerciseByEquipment,
  },
  {
    method: "GET",
    path: "/getExerciseByQuery",
    handler: getExerciseByQuery,
  },
  {
    method: "GET",
    path: "/getDetailExercise",
    handler: getDetailExercise,
  },
  {
    method: "GET",
    path: "/getMuscle",
    handler: getMuscle,
  },
  {
    method: "GET",
    path: "/getCategory",
    handler: getCategory,
  },
  {
    method: "GET",
    path: "/getTopRatedExercise",
    handler: getTopRatedExercise,
  },
];

module.exports = routes;
