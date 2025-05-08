export async function POST(request) {
  try {
    const transaction = await request.json();
    
    // Here you would typically save to your database
    // This is a placeholder response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Transaction saved successfully',
      data: transaction 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
