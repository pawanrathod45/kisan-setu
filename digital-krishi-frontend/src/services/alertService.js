const alertService = {
  getAlerts: async () => {
    return [
      {
        id: 1,
        title: 'Heavy Rain Alert',
        message: 'Expected rainfall in next 24 hours',
        severity: 'high',
        icon: 'rain'
      },
      {
        id: 2,
        title: 'Pest Warning',
        message: 'Aphid infestation reported nearby',
        severity: 'medium',
        icon: 'warning'
      }
    ];
  }
};

export default alertService;
