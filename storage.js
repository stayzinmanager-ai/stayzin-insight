const STORAGE_KEY = "stayzin_complaints";

const StorageManager = {
    getComplaints: function() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    },
    saveComplaint: function(item) {
        const data = this.getComplaints();
        data.unshift(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    clearAll: function() {
        localStorage.removeItem(STORAGE_KEY);
    }
};