// Hybrid Bot to handle bot sabnzb and nzbget 


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event).catch(
    (err) => new Response("Report this page when asked at the time of support... ==> " + err.stack, { status: 500 })
  )
  );
});

const config ={
  bot_token:'',
  authorised_chats:[],
  sudo_users:[],
  sabnzb_domain:'https://xx/sabnzbd',
  sabnzb_apikey:'e3',
  nzbhydra_domain:'',
  nzbhydra_apikey:'',
  nzbget_domain:'',
  nzbget_apikey:'',

}

async function handleRequest(request, event) {
  const region = request.headers.get('cf-ipcountry');
  const asn_servers = request.cf.asn;
  const referer = request.headers.get("Referer");
  var user_ip = request.headers.get("CF-Connecting-IP");
  let url = new URL(request.url);
  let path = url.pathname;
  let hostname = url.hostname;


  if (path == '/setwebhook') {
    const webhookfetch = await fetch('https://api.telegram.org/bot'+config.bot_token+'/setWebhook?url=https://'+hostname+'/telegram')
    if (!webhookfetch.ok){
      return new Response('Error While Setting Webhook',{
        status:webhookfetch.status
      })
    }
    const webhookres = await webhookfetch.json()
    if(webhookres.ok == false){
      return new Response(webhookres.description)
    }else {
      return new Response('Webhook was set successfully!')
}
  }else if(path == '/telegram'){
    //Handle tg webhook here

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response('Only JSON content is accepted', { status: 400 });
    }

   const data = await request.json()
   if (data.message && data.message.text) {
    const chatId = data.message.chat.id;
    const messageId = data.message.message_id;
    const messageText = data.message.text;
    const username = data.message.from.username; 
    const firstName = data.message.from.first_name;
    const UserID = data.message.from.id;

  // HANDLE START COMMAND

     if (messageText.startsWith('/start')&& config.authorised_chats.includes(chatId)) {
      const welcomemsg = ''
       const inlineButtons = [
         [{ text: 'Owner', callback_data: 'start Callback Button' }, { text: 'GitHub Repo', callback_data: 'Other Callback Button' }],
        
       ]
       await sendMessage(chatId, messageId, messageText, inlineButtons)
 
  // HANDLE IMDB COMMAND 

     } else if (messageText.startsWith('/imdb') && config.authorised_chats.includes(chatId)) {
       const inlineButtons = [
         [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],

       ]

       await sendMessage(chatId, messageId, 'Please Specify type!!', inlineButtons)
 
     } else if (messageText.startsWith('/search') && config.authorised_chats.includes(chatId)) {
      const inlineButtons = [
        [{ text: 'Anime', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],
        [{ text: 'TV Series', callback_data: 'series' + messageText }, { text: 'Movie', callback_data: 'Movie' }],

      ]

      await sendMessage(chatId, messageId, 'Select Category!!', inlineButtons)

    }
     else{
      await sendMessage(chatId, messageId, 'Not a Authorised User or Chat!!')
 
     }
  
  
     // END COMMAND HANDLING 

/*----------------------------------------------------------------------------------------------------*/

    // HANDLE CALLBACK QUERY 

  }else if(data.callback_query && data.callback_query.data){
    const callbackData = data.callback_query.data;
    const chatId = data.callback_query.message.chat.id;
    const messageId = data.callback_query.message.message_id;
    const username = data.callback_query.from.username;
    await sendMessage(chatId,messageId,callbackData)
 
  }
  return new Response('OK', { status: 200 });

  }else{
    //return not valid path 
    return new Response('Not a Valid request path', { 
      status: 400 
    });

    }
}










async function sendMessage(chatID, replyID, messageText, inlineButtons = null) {
  try {
    const requestBody = {
      chat_id: chatID,
    // reply_to_message_id: replyID,
      text: `${messageText}`,
      parse_mode: 'HTML'
    };

    if (inlineButtons) {
      requestBody.reply_markup = JSON.stringify({
        inline_keyboard: inlineButtons
      });
    }

    const sent = await fetch('https://api.telegram.org/bot' + config.bot_token + '/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    const data = await sent.json();

    // Check if the request was successful before parsing the response
    if (!sent.ok) {
      throw new Error('Failed to send message\n'+JSON.stringify(data));
    }

   // const data = await sent.json();
    return data;
  } catch (err) {
    console.error("Error sending message:", err);
    throw err; // Rethrow the error for the caller to handle
  }
}
