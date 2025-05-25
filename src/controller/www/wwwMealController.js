const Meal = require("../../models/Meal");

const getMealDay = async (req, res) => { 
    try {
        // Bugünün tarihini YYYY-MM-DD formatında al
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // "2025-05-23" formatı

        // Bu formatta ara
        const mealDay = await Meal.findOne({ 
            date: dateString 
        });

        if (!mealDay) {
            return res.status(404).json({ 
                error: 'Bugünün menüsü bulunamadı',
                searchedDate: dateString
            });
        }

        res.json(mealDay);
    } catch (error) {
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
}
const getMealWeek = async (req, res) => {
    try {
        // Bugünün tarihini al
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Haftanın son gününü hesapla (6 gün sonrası)
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 6);

        // Haftalık menüyü bul
        const mealWeek = await Meal.find({ 
            date: { 
                $gte: today,
                $lte: endOfWeek 
            }
        }).sort({ date: 1 });

        res.json(mealWeek);
    } catch (error) {
        console.error('Haftalık menü getirme hatası:', error);
        res.status(500).json({ 
            error: 'Haftalık menü getirilirken bir hata oluştu' 
        });
    }
}

module.exports = {
    getMealDay,
    getMealWeek
};