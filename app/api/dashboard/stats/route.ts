import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodesMonitored: 42,
    nodesLimit: 50,
    activeFleets: 128,
    delayReductionPercent: 36.8,
    co2TonsSaved: 4.2,
    activeAlerts: [
      {
        id: 'alert-1',
        title: 'Heavy Traffic Queue Detected',
        location: 'Bay Bridge Exit',
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'alert-2',
        title: 'Transit Wave Priority Executed',
        location: 'Grand Ave Corridor',
        severity: 'INFO',
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
