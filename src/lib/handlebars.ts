import Handlebars from "handlebars";

// Register global Handlebars helpers
Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

// Helper to access nested properties safely
Handlebars.registerHelper("get", (obj, path) => {
  if (!obj || !path) return "";
  
  const keys = path.split(".");
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return "";
    }
  }
  
  return result;
});

// Helper for accessing googleForm responses
Handlebars.registerHelper("googleFormResponse", (responses, questionName) => {
  if (!responses || !questionName) return "";
  return responses[questionName] || "";
});

export { Handlebars };