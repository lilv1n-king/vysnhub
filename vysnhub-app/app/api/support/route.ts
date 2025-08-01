import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/utils/product-data';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const mockResponse = await generateSupportResponse(question);
    
    return NextResponse.json({ 
      answer: mockResponse 
    });

  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { error: 'Failed to process support question' },
      { status: 500 }
    );
  }
}

async function generateSupportResponse(question: string): Promise<string> {
  const q = question.toLowerCase();
  
  if (q.includes('ip65') || q.includes('waterproof')) {
    try {
      const products = await searchProducts('IP65');
      return `For IP65 rated products, I found ${products.length} options in our catalog. These are fully protected against water jets and suitable for outdoor use. Would you like me to show you some specific downlights or other fixtures with IP65 rating?`;
    } catch (error) {
      console.error('Error searching products:', error);
      return `For IP65 rated products, we have many options in our catalog. These are fully protected against water jets and suitable for outdoor use. Would you like me to show you some specific downlights or other fixtures with IP65 rating?`;
    }
  }
  
  if (q.includes('dali') && q.includes('dimming')) {
    return `DALI (Digital Addressable Lighting Interface) dimming is available on many of our professional fixtures. This allows for precise control and addressing of individual fixtures. I can help you find DALI-compatible products - what type of fixture are you looking for? (downlights, panels, track lights, etc.)`;
  }
  
  if (q.includes('downlight') || q.includes('recessed')) {
    return `We have a wide range of LED downlights available. To help you find the best option, could you tell me:
- What's your preferred wattage range?
- Do you need dimming capability?
- What IP rating do you require?
- What color temperature (3000K warm, 4000K neutral, 6500K cool)?`;
  }
  
  if (q.includes('track light') || q.includes('spotlight')) {
    return `Our track lighting systems offer flexible accent lighting solutions. We have both single-circuit and 3-phase track systems available. Are you looking for specific beam angles or particular mounting requirements?`;
  }
  
  if (q.includes('panel') || q.includes('office')) {
    return `LED panels are perfect for office environments. We offer various sizes (600x600mm, 1200x300mm, 1200x600mm) with different light outputs and dimming options. Many include emergency functionality and DALI control. What size space are you lighting?`;
  }
  
  if (q.includes('emergency') || q.includes('exit')) {
    return `We have comprehensive emergency lighting solutions including exit signs, emergency downlights, and maintained/non-maintained fixtures. All comply with current safety standards. Do you need self-test functionality or central battery systems?`;
  }
  
  if (q.includes('warehouse') || q.includes('high bay')) {
    return `For warehouse applications, our high-bay LED fixtures provide excellent light distribution and energy efficiency. Available in various wattages (100W-200W+) with motion sensors and daylight harvesting options. What's your mounting height and area coverage needed?`;
  }
  
  if (q.includes('outdoor') || q.includes('exterior')) {
    return `Our outdoor lighting range includes floodlights, wall packs, bollards, and street lighting. Most feature IP65+ ratings and are available with photocell and motion sensor options. What type of outdoor area are you illuminating?`;
  }
  
  if (q.includes('price') || q.includes('cost') || q.includes('budget')) {
    return `I'd be happy to help with pricing information. Product prices vary based on specifications and quantities. For detailed pricing and potential volume discounts, please contact our sales team at +49 (0) 123 456 7890 or email sales@vysn.com.`;
  }
  
  if (q.includes('installation') || q.includes('wiring')) {
    return `Installation requirements vary by product type. All our fixtures come with detailed installation guides and technical drawings. For complex installations or specific wiring questions, I recommend consulting with a qualified electrician. Do you need specific technical drawings or installation guides?`;
  }
  
  if (q.includes('warranty') || q.includes('guarantee')) {
    return `Our LED products come with comprehensive warranties - typically 3-5 years depending on the product line. This covers LED driver failures and housing defects. Extended warranty options are available for commercial projects. Which product are you asking about specifically?`;
  }
  
  return `I'm here to help with your lighting questions! I can assist with:
- Product recommendations based on your requirements
- Technical specifications and compatibility
- Installation guidance
- Pricing information
- Project planning

Could you provide more details about what you're looking for? For example: fixture type, space requirements, or specific technical needs?`;
}