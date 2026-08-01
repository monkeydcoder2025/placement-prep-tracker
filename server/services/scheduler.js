export function generateSchedule(startDateStr, completedIds, panicPauses, academicCalendar, striverData, campxData) {
  const startDate = new Date(startDateStr);
  const endLimitDate = new Date(startDate);
  endLimitDate.setMonth(endLimitDate.getMonth() + 18);
  
  // Flatten all Striver subsections
  let striverSubsections = [];
  striverData.forEach(step => {
    step.subsections.forEach(sub => {
      striverSubsections.push({
        ...sub,
        step: step.step,
        stepTitle: step.stepTitle
      });
    });
  });
  
  // Helper to check if a date is paused
  const isDatePaused = (date) => {
    for (let pause of panicPauses) {
      const pStart = new Date(pause.startDate);
      const pEnd = new Date(pause.endDate);
      pStart.setHours(0,0,0,0);
      pEnd.setHours(23,59,59,999);
      if (date >= pStart && date <= pEnd) return { paused: true, type: 'panic' };
    }
    // Exam pauses could be handled here if academicCalendar was provided
    return { paused: false, type: null };
  };

  let saturdays = [];
  let sundays = [];
  
  let currDate = new Date(startDate);
  let striverIdx = 0;
  let campxIdx = 0;
  
  const totalStriver = striverSubsections.length;
  const totalCampx = campxData.length;
  let completedStriver = 0;
  let completedCampx = 0;

  while (currDate <= endLimitDate && (striverIdx < striverSubsections.length || campxIdx < campxData.length)) {
    const dayOfWeek = currDate.getDay();
    const pauseInfo = isDatePaused(currDate);
    const isExamPause = pauseInfo.type === 'exam';
    const isPanicPause = pauseInfo.type === 'panic';
    const active = !pauseInfo.paused;

    if (dayOfWeek === 6) { // Saturday
      let assignedSubsections = [];
      if (active) {
        // Assign up to 2 striver subsections
        if (striverIdx < striverSubsections.length) {
          let sub1 = striverSubsections[striverIdx++];
          sub1.completed = completedIds.includes(sub1.id);
          if (sub1.completed) completedStriver++;
          assignedSubsections.push(sub1);
        }
        if (striverIdx < striverSubsections.length) {
          let sub2 = striverSubsections[striverIdx++];
          sub2.completed = completedIds.includes(sub2.id);
          if (sub2.completed) completedStriver++;
          assignedSubsections.push(sub2);
        }
      }
      saturdays.push({
        date: currDate.toISOString().split('T')[0],
        subsections: assignedSubsections,
        isExamPause,
        isPanicPause
      });
    } else if (dayOfWeek === 0) { // Sunday
      let assignedWeek = null;
      if (active && campxIdx < campxData.length) {
        let w = campxData[campxIdx++];
        w.completed = completedIds.includes(`w${w.weekNumber}`);
        if (w.completed) completedCampx++;
        assignedWeek = w;
      }
      sundays.push({
        date: currDate.toISOString().split('T')[0],
        week: assignedWeek,
        isExamPause,
        isPanicPause
      });
    }

    currDate.setDate(currDate.getDate() + 1);
  }
  
  // Also count remaining completed that might not have been iterated over (if schedule is short)
  for (let i = striverIdx; i < striverSubsections.length; i++) {
    if (completedIds.includes(striverSubsections[i].id)) completedStriver++;
  }
  for (let i = campxIdx; i < campxData.length; i++) {
    if (completedIds.includes(`w${campxData[i].weekNumber}`)) completedCampx++;
  }

  return {
    saturdays,
    sundays,
    stats: {
      totalStriver,
      completedStriver,
      totalCampx,
      completedCampx
    }
  };
}

export function getCurrentWeekend(schedule) {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Find next or current weekend
  let currentSat = schedule.saturdays.find(s => new Date(s.date) >= today || (new Date(s.date).getTime() === today.getTime() - 86400000));
  let currentSun = schedule.sundays.find(s => new Date(s.date) >= today);
  
  if (!currentSat && schedule.saturdays.length > 0) currentSat = schedule.saturdays[schedule.saturdays.length - 1];
  if (!currentSun && schedule.sundays.length > 0) currentSun = schedule.sundays[schedule.sundays.length - 1];

  return {
    saturday: currentSat,
    sunday: currentSun
  };
}

export function getStats(schedule, completedIds) {
  return schedule.stats;
}
