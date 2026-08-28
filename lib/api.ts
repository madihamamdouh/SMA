const API_BASE_URL = "http://192.168.70.98:4000";

export async function apiRequest(
     path: string,
     token: string,
     options: RequestInit = {}
) {
     const res = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
               ...options.headers,

          },
     });
     if (!res.ok) {
          const error = await res.json().catch(() => ({ error: "Request Failed" }));
          throw new Error(error.error || "Request Failed");
     }
     return res.json();
}

function normalizeSubscription(doc:any):Subscription {
     const {_id,__v, ...rest} = doc;
     return{id:_id, ...rest};
}

export const api = {
     getSubscriptions: async (token: string) => {
          const data = await apiRequest("/subscriptions", token);
          return data.map(normalizeSubscription);
     },

     createSubscription: async (token: string, data: Partial<Subscription>) =>{

          const created = await apiRequest(`/subscriptions`, token, {
               method: "POST",
               body: JSON.stringify(data),
          });
          return normalizeSubscription(created);
     },
     updateSubscription: async (token: string, id: string, data: Partial<Subscription>) =>{

        const update =  await apiRequest(`/subscriptions/${id}`, token, {
               method: "PUT",
               body: JSON.stringify(data),
          });
          return normalizeSubscription(update);
     },
     deleteSubscription: async (token: string, id: string) => {
          await apiRequest(`/subscriptions/${id}`, token, { method: "DELETE" });
          return null;
     },
     getInsights: async (token: string)=>{
          return apiRequest("/subscriptions/insights",token)
     },
};