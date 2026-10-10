/**
 * Prediction Service: Smart Virtual Queue Waiting-Time Calculation
 * Designed with a reliable rule-based baseline and prepared for ML model plugin.
 */

/**
 * Calculates estimated waiting time in minutes and recommended arrival time.
 * @param {Object} params
 * @param {number} params.peopleAhead - Count of waiting citizens ahead
 * @param {number} params.averageServiceTime - Service standard average duration in minutes
 * @param {number} params.activeCounters - Number of operational counters serving this service/dept
 * @param {string} params.priority - Normal or Priority
 * @returns {Object} { estimatedWaitTimeMinutes, recommendedArrivalTime, calculationBreakdown }
 */
const calculateWaitingTime = ({
  peopleAhead = 0,
  averageServiceTime = 10,
  activeCounters = 1,
  priority = 'NORMAL',
}) => {
  const safeCounters = Math.max(1, activeCounters);
  const safeAvgTime = Math.max(2, averageServiceTime);

  if (peopleAhead <= 0) {
    const now = new Date();
    return {
      estimatedWaitTimeMinutes: 0,
      recommendedArrivalTime: formatTime(now),
      recommendedArrivalDate: now,
      calculationBreakdown: {
        peopleAhead: 0,
        safeAvgTime,
        safeCounters,
        factor: 1.0,
      },
    };
  }

  // Workload / Peak Hour adjustment factor
  const currentHour = new Date().getHours();
  let peakFactor = 1.0;
  // Peak government rush hours: 10:00 - 13:00 and 14:00 - 15:30
  if ((currentHour >= 10 && currentHour <= 13) || (currentHour >= 14 && currentHour <= 15)) {
    peakFactor = 1.15; // 15% rush buffer
  }

  // Priority adjustment: Priority citizens move ahead with expedited scheduling
  const priorityMultiplier = priority !== 'NORMAL' ? 0.75 : 1.0;

  // Formula: (People Ahead * Avg Service Time / Active Counters) * peakFactor * priorityMultiplier
  const rawMinutes = ((peopleAhead * safeAvgTime) / safeCounters) * peakFactor * priorityMultiplier;
  const estimatedWaitTimeMinutes = Math.max(1, Math.round(rawMinutes));

  // Compute recommended arrival time: arrival ~10 mins before turn, or now if less than 10 mins
  const now = new Date();
  const arrivalDate = new Date(now.getTime() + estimatedWaitTimeMinutes * 60 * 1000);
  const recommendedArrivalTime = formatTime(arrivalDate);

  return {
    estimatedWaitTimeMinutes,
    recommendedArrivalTime,
    recommendedArrivalDate: arrivalDate,
    calculationBreakdown: {
      peopleAhead,
      averageServiceTime: safeAvgTime,
      activeCounters: safeCounters,
      peakFactor,
      priorityMultiplier,
    },
  };
};

/**
 * Format Date to readable AM/PM string, e.g., "10:42 AM"
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Pluggable Machine Learning Waiting Time Predictor
 * When an external ML model or microservice is configured, this delegates.
 */
const predictWithML = async (features) => {
  // If external AI/ML service URL configured:
  if (process.env.ML_PREDICTION_SERVICE_URL) {
    try {
      // In future: const res = await axios.post(process.env.ML_PREDICTION_SERVICE_URL, features);
      // return res.data;
    } catch (err) {
      console.warn('[AI/ML Predictor] Fallback to rule-based engine:', err.message);
    }
  }
  // Baseline engine fallback:
  return calculateWaitingTime(features);
};

module.exports = {
  calculateWaitingTime,
  predictWithML,
};
