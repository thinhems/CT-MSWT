/**
 * Time validation utilities for the application
 */

/**
 * Validates if a time string is in the correct HH:MM:SS format
 * @param time - Time string to validate
 * @returns boolean - True if valid, false otherwise
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return timePattern.test(time);
};

/**
 * Compares two time strings and checks if the end time is after start time
 * @param startTime - Start time in HH:MM:SS format
 * @param endTime - End time in HH:MM:SS format
 * @returns boolean - True if end time is after start time, false otherwise
 */
export const isEndTimeAfterStartTime = (startTime: string, endTime: string): boolean => {
  // For same-day comparison, simple string comparison works for HH:MM:SS format
  return endTime > startTime;
};

/**
 * Compares two date strings and checks if the end date is after start date
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns boolean - True if end date is after start date, false otherwise
 */
export const isEndDateAfterStartDate = (startDate: string, endDate: string): boolean => {
  return new Date(endDate) > new Date(startDate);
};

/**
 * Validates time input and provides user-friendly error messages
 * @param startTime - Start time string
 * @param endTime - End time string
 * @returns object with isValid boolean and error message if invalid
 */
export const validateTimeRange = (startTime: string, endTime: string): {
  isValid: boolean;
  error?: string;
} => {
  // Check if both times are provided
  if (!startTime || !endTime) {
    return {
      isValid: false,
      error: "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc!"
    };
  }

  // Check time format
  if (!isValidTimeFormat(startTime)) {
    return {
      isValid: false,
      error: "Thời gian bắt đầu không hợp lệ! Vui lòng nhập theo định dạng HH:MM:SS"
    };
  }

  if (!isValidTimeFormat(endTime)) {
    return {
      isValid: false,
      error: "Thời gian kết thúc không hợp lệ! Vui lòng nhập theo định dạng HH:MM:SS"
    };
  }

  // Check if end time is after start time
  if (!isEndTimeAfterStartTime(startTime, endTime)) {
    return {
      isValid: false,
      error: "Thời gian kết thúc phải sau thời gian bắt đầu!"
    };
  }

  return { isValid: true };
};

/**
 * Validates date range and provides user-friendly error messages
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns object with isValid boolean and error message if invalid
 */
export const validateDateRange = (startDate: string, endDate: string): {
  isValid: boolean;
  error?: string;
} => {
  // Check if both dates are provided
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: "Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc!"
    };
  }

  // Check if end date is after start date
  if (!isEndDateAfterStartDate(startDate, endDate)) {
    return {
      isValid: false,
      error: "Ngày kết thúc phải sau ngày bắt đầu!"
    };
  }

  return { isValid: true };
};

/**
 * Formats time input to ensure proper HH:MM:SS format
 * @param value - Input time value
 * @returns formatted time string
 */
export const formatTimeInput = (value: string): string => {
  // Remove any non-digit characters except colon
  let cleanValue = value.replace(/[^\d:]/g, "");

  // Limit to HH:MM:SS format
  if (cleanValue.length > 8) {
    cleanValue = cleanValue.substring(0, 8);
  }

  // Auto-add colons after 2 and 5 digits
  if (cleanValue.length === 2 && !cleanValue.includes(":")) {
    cleanValue += ":";
  } else if (cleanValue.length === 5 && cleanValue.split(":").length === 2) {
    cleanValue += ":";
  }

  // Validate the time format
  if (cleanValue.includes(":")) {
    let [hours, minutes, seconds] = cleanValue.split(":");

    // Validate hours (00-23)
    if (hours && parseInt(hours) > 23) {
      hours = "23";
    }

    // Validate minutes (00-59)
    if (minutes && parseInt(minutes) > 59) {
      minutes = "59";
    }

    // Validate seconds (00-59)
    if (seconds && parseInt(seconds) > 59) {
      seconds = "59";
    }

    // Ensure two digits for hours
    if (hours && hours.length === 1) {
      hours = "0" + hours;
    }

    // Ensure two digits for minutes
    if (minutes !== undefined) {
      if (minutes.length === 1) {
        minutes = "0" + minutes;
      } else if (minutes.length === 0) {
        minutes = "00";
      }
    }

    // Ensure two digits for seconds
    if (seconds !== undefined) {
      if (seconds.length === 1) {
        seconds = "0" + seconds;
      } else if (seconds.length === 0) {
        seconds = "00";
      }
    }

    cleanValue = hours + ":" + (minutes || "00") + ":" + (seconds || "00");
  } else if (cleanValue.length === 1 || cleanValue.length === 2) {
    // If only hours are entered, pad with zero if needed
    if (cleanValue.length === 1) {
      cleanValue = "0" + cleanValue;
    }
    cleanValue += ":00:00";
  }

  return cleanValue;
};

