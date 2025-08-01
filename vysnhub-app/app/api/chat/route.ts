import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only when API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { question, product } = await request.json();
    
    if (!question || !product) {
      return NextResponse.json(
        { error: 'Question and product data are required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!openai) {
      console.warn('OpenAI API key not configured, using mock response');
      const mockResponse = generateMockResponse(question, product);
      return NextResponse.json({ answer: mockResponse });
    }

    try {
      // Create a comprehensive product context for the AI
      const productContext = `
Product: ${product.vysnName || 'Unknown Product'}
Item Number: ${product.itemNumberVysn}
Description: ${product.longDescription || product.shortDescription || 'No description available'}
Power: ${product.wattage || 'N/A'}W
Lumen Output: ${product.lumen || 'N/A'} lm
Color Temperature: ${product.cct || 'N/A'}K
Beam Angle: ${product.beamAngle || 'N/A'}°
IP Rating: ${product.ingressProtection || 'N/A'}
Energy Class: ${product.energyClass || 'N/A'}
Control: ${product.steering || 'N/A'}
Installation: ${product.installation || 'N/A'}
Material: ${product.material || 'N/A'}
Dimensions: ${product.lengthMm || ''}mm x ${product.widthMm || ''}mm x ${product.heightMm || ''}mm
Price: €${product.grossPrice || 'Contact for pricing'}
Categories: ${product.category1 || ''} ${product.category2 || ''}
      `.trim();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful lighting product expert for VYSN, a professional lighting company. You provide detailed, accurate technical information about LED lighting products to electrical contractors and professionals. 

Be specific, technical, and helpful. Always relate your answers directly to the product specifications provided. If you don't have specific information, clearly state what you don't know and suggest contacting VYSN technical support for detailed specifications.

Keep responses concise but informative, focusing on practical applications and installation considerations.`
          },
          {
            role: "user", 
            content: `Question about this product: "${question}"\n\nProduct Information:\n${productContext}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try asking your question differently.';
      
      return NextResponse.json({ answer: aiResponse });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Fallback to mock response if OpenAI fails
      const mockResponse = generateMockResponse(question, product);
      return NextResponse.json({ answer: mockResponse });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}

function generateMockResponse(question: string, product: any): string {
  const q = question.toLowerCase();
  
  if (q.includes('compatible') || q.includes('work with')) {
    return `The ${product.vysnName || 'product'} is designed to work with standard electrical systems. ${
      product.steering ? `It supports ${product.steering} dimming.` : 'Please check dimming compatibility with your control system.'
    } For specific compatibility questions, I'd recommend consulting with an electrician or contacting our technical support.`;
  }
  
  if (q.includes('install') || q.includes('mount')) {
    return `This product uses ${product.installation || 'standard'} mounting. ${
      product.ingressProtection ? `With its ${product.ingressProtection} rating, it's suitable for the appropriate environmental conditions.` : ''
    } Always follow local electrical codes and manufacturer instructions during installation.`;
  }
  
  if (q.includes('bright') || q.includes('light') || q.includes('lumen')) {
    return `The ${product.vysnName || 'product'} produces ${product.lumen || 'N/A'} lumens of light output at ${product.wattage || 'N/A'} watts, giving you ${
      product.lumen && product.wattage ? Math.round(product.lumen / product.wattage) : 'efficient'
    } lumens per watt efficiency. ${
      product.cct ? `The color temperature is ${product.cct}K.` : ''
    }`;
  }
  
  if (q.includes('power') || q.includes('watt') || q.includes('energy')) {
    return `This fixture consumes ${product.wattage || 'N/A'} watts and has an energy efficiency rating of ${product.energyClass || 'N/A'}. This makes it an energy-efficient choice for your lighting needs.`;
  }
  
  if (q.includes('outdoor') || q.includes('weather') || q.includes('ip')) {
    return `The ${product.vysnName || 'product'} has an ${product.ingressProtection || 'standard'} rating. ${
      product.ingressProtection && product.ingressProtection.includes('65') ? 'This makes it suitable for outdoor use and wet locations.' :
      product.ingressProtection && product.ingressProtection.includes('44') ? 'This provides protection against splashing water.' :
      'Please check the IP rating for your specific environmental requirements.'
    }`;
  }
  
  return `Based on the ${product.vysnName || 'product'} specifications, this is a ${product.wattage || ''}W LED fixture producing ${product.lumen || ''} lumens. ${
    product.longDescription ? product.longDescription : 'For detailed technical information, please refer to the product manual or contact our technical support team.'
  }`;
}