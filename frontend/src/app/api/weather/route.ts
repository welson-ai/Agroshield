import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Fetch current weather data from Open-Meteo API
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=rain&hourly=rain&timezone=auto`
    )

    if (!weatherResponse.ok) {
      throw new Error('Weather API request failed')
    }

    const weatherData = await weatherResponse.json()
    
    return NextResponse.json({
      success: true,
      data: {
        current: weatherData.current?.rain || 0,
        hourly: weatherData.hourly?.rain || [],
        location: {
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        },
        timestamp: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
