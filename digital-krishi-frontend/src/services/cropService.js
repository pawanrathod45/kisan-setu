const cropService = {
  getCropData: async () => {
    return {
      crops: [],
      calendar: []
    };
  },
  getCalendarPreview: async () => {
    return {
      currentStage: 'Growing',
      nextStage: 'Flowering',
      progress: 65,
      nextActivity: 'Apply fertilizer',
      daysRemaining: 7
    };
  }
};

export default cropService;
