export const sendTransactionToBackend = async (transaction) => {
  try {
    const response = await fetch('http://localhost:3001/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Transaction saved successfully'
      };
    } else {
      throw new Error(result.message || 'Failed to save transaction');
    }

  } catch (error) {
    console.error('Error sending transaction:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send transaction to server'
    };
  }
};

export const getTransactionsFromBackend = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/transactions');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: 'Transactions retrieved successfully'
    };

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch transactions from server'
    };
  }
};
