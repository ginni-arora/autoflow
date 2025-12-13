export const generateGoogleFormScript = (webhookUrl: string) => {
  // Validate webhook URL to prevent code injection
  if (!webhookUrl || typeof webhookUrl !== 'string') {
    throw new Error('Invalid webhook URL provided');
  }
  
  // Basic URL validation
  try {
    new URL(webhookUrl);
  } catch {
    throw new Error('Invalid webhook URL format');
  }
  
  // Escape single quotes in the URL to prevent script injection
  const safeWebhookUrl = webhookUrl.replace(/'/g, "\\'");
  
  return `function onFormSubmit(event) {
  try {
    const form = event.source;
    const responses = event.response.getItemResponses();
    
    const formData = {
      formId: form.getId(),
      formTitle: form.getTitle(),
      respondentEmail: event.response.getRespondentEmail(),
      responses: {},
      timestamp: new Date().toISOString()
    };
    
    // Process each response
    responses.forEach(function(itemResponse) {
      const question = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      formData.responses[question] = answer;
    });
    
    // Send to webhook
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(formData)
    };
    
    UrlFetchApp.fetch('${safeWebhookUrl}', options);
    
  } catch (error) {
    console.error('Error in onFormSubmit:', error);
  }
}`;
};