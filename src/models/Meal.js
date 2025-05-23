const mealSchema = new mongoose.Schema(
    {
      date: { type: Date, required: true, unique: true },
      pilav: {
        name: { type: String, required: true},
        calories: { type: Number, required: true },
      },
      corba: {
        name: { type: String, required: true },
        calories: { type: Number, required: true },
      },
      anaYemek: {
        name: { type: String, required: true },
        calories: { type: Number, required: true },
      },
      tatli: {
        name: { type: String, default: null },
        calories: { type: Number, default: 0 },
      },
      totalCalories: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },

    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Meal", mealSchema);