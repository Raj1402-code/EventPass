export function analyzeEventStats(query: string, stats: any) {
  const q = query.toLowerCase();
  const { event, totalRegistered, checkedInCount, hourlyDistribution, attendees } = stats;
  const capacity = event.capacity;
  const remainingSpots = Math.max(0, capacity - checkedInCount);
  const checkInRate = capacity > 0 ? ((checkedInCount / capacity) * 100).toFixed(1) : 0;

  const checkedInAttendees = (attendees || [])
    .filter((a: any) => a.status === 'checked_in' && a.checked_in_at)
    .sort((a: any, b: any) => new Date(a.checked_in_at).getTime() - new Date(b.checked_in_at).getTime());

  if (q.includes('peak') || q.includes('time') || q.includes('busiest') || q.includes('when')) {
    if (hourlyDistribution && Object.keys(hourlyDistribution).length > 0) {
      let maxHour = '';
      let maxCount = -1;
      for (const [hour, count] of Object.entries(hourlyDistribution) as [string, number][]) {
        if (count > maxCount) {
          maxCount = count;
          maxHour = hour;
        }
      }
      return `Check-ins peaked around **${maxHour}** with **${maxCount} attendees** checked in during that hour window. Overall check-in rate is currently at **${checkInRate}%** (${checkedInCount}/${capacity}).`;
    } else if (checkedInAttendees.length > 0) {
      const peakTime = new Date(checkedInAttendees[0].checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Check-ins started active around **${peakTime}**. Total checked in so far: **${checkedInCount}** out of **${capacity}** capacity limit.`;
    } else {
      return `No check-ins recorded yet for "${event.title}". Capacity is ${capacity} with 0 attendees checked in.`;
    }
  }

  if (q.includes('capacity') || q.includes('remaining') || q.includes('spot') || q.includes('left') || q.includes('full')) {
    return `Currently, **${checkedInCount}** out of **${capacity}** spots are filled (**${checkInRate}%** attendance). There are **${remainingSpots} remaining spots** available.`;
  }

  if (q.includes('first') || q.includes('earliest')) {
    if (checkedInAttendees.length > 0) {
      const first = checkedInAttendees[0];
      const timeStr = new Date(first.checked_in_at).toLocaleTimeString();
      return `The first person to check in was **${first.attendee_name}** (${first.attendee_email}) at **${timeStr}**.`;
    }
    return `No attendees have checked in yet.`;
  }

  if (q.includes('last') || q.includes('latest') || q.includes('recent')) {
    if (checkedInAttendees.length > 0) {
      const last = checkedInAttendees[checkedInAttendees.length - 1];
      const timeStr = new Date(last.checked_in_at).toLocaleTimeString();
      return `The latest person to check in was **${last.attendee_name}** (${last.attendee_email}) at **${timeStr}**.`;
    }
    return `No attendees have checked in yet.`;
  }

  return `Event Summary for "${event.title}": **${checkedInCount}** checked in out of **${capacity}** capacity (**${checkInRate}%** capacity filled). Total registered attendees: **${totalRegistered}**. ${remainingSpots} spots remaining.`;
}
