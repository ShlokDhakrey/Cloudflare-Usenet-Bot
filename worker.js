addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event));
});

const authConfig = {
  "sudo_users_ids": '684', // Provide appropriate user IDs
  "authorised_chat_id": "-1002", // Provide appropriate chat IDs
  "sabNZB_Domain": "https://example.com/sabnzbd",
  "bot_token": "677789627lF-HpA",
  "sabNZB_apiKEY": "e26bd3",
  "Nzb_hydra_Domain": "https://example.com/nzbhydra",
  "nzbhydra_apikey": "2"
}

async function handleRequest(request, event) {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response('Only JSON content is accepted', { status: 400 });
    }

    const data = await request.json();

    if (data.message && data.message.text) {
      const chatId = data.message.chat.id;
      const messageId = data.message.message_id;
      const messageText = data.message.text;
      const username = data.message.from.username;
      const firstName = data.message.from.first_name;
      const UserID = data.message.from.id;

      if (messageText.startsWith('/start') && authConfig.authorised_chat_id == chatId) {
        await sendMessage(chatId, messageId, "Hello Captain " + firstName + '\n\nWelcome to the serverless Cloudflare Usenet Downloader Bot !!\n\nUse command /search to search your favourite movies,series,music or anything you like\n\nCC : \nUser : ' + firstName + '\nId : ' + UserID + '\nUsername : @' + username, username);
      }else if (messageText.startsWith('/search') && authConfig.authorised_chat_id == chatId) {
        const keyword = messageText.split(' ').slice(1).join(' ');
        if (!keyword) {
            await sendMessage(chatId, messageId, "Search query empty!", username);
        } else {
            try {
              const cleanedKeyword = keyword.replace('-r', '').trim();

                let queryString;
                if (keyword.includes('-r')) {
                  //  const cleanedKeyword = keyword.replace('-r', '').trim();
                    queryString = new URLSearchParams({
                        apikey: authConfig.nzbhydra_apikey,
                        t: 'search',
                        q: cleanedKeyword
                    }).toString();
               /* } else {
                    queryString = new URLSearchParams({
                        apikey: authConfig.nzbhydra_apikey,
                        t: 'search',
                        q: keyword 
                    }).toString(); 
                }*/
    
                const hydrafetch = await fetch(`${authConfig.Nzb_hydra_Domain}/api?${queryString}`, {
                    method: 'GET'
                });
    
                if (!hydrafetch.ok) {
                    throw new Error("Search Response was not OK!\nTry after Sometime or check code!!");
                }
    
                const hydraBuffer = await hydrafetch.arrayBuffer(); // Fetch the response as ArrayBuffer
                const hydraText = new TextDecoder("utf-8").decode(hydraBuffer); 

                const items = hydraText.match(/<item>[\s\S]*?<\/item>/g);
                const regex = /total="(\d+)"/;

                // Execute the regular expression on the XML string
                const match = regex.exec(hydraText)
                const total = match ? match[1] : 0; // Handling the case when match is null

                const newres = [];
                if (!items || items.length === 0){
                await sendMessage(chatId, messageId, 'No results found!');

               }else { 
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const title = item.match(/<title>(.*?)<\/title>/)[1];
                    const size = item.match(/<newznab:attr name="size" value="(.*?)"\/>/)[1];
                    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)[1];
                    const nzbid = item.match(/<guid isPermaLink="false">(.*?)<\/guid>/)[1];
                    const regex = /total="(\d+)"/;

                    // Execute the regular expression on the XML string
                    const match = regex.exec(hydraText)
                    const total = match[1];

                    // Calculate the time difference 
                    const daysAgo = getTimeDifference(new Date(pubDate));
     
                    // Modify the response
                    const modifiedItem =`\n***\n**Name : **${title}\n**Size : **${formatFileSize(size)}\n**Age : **${daysAgo}\n**ID : **${nzbid}`;
   
                    newres.push(modifiedItem);
                } 
             //  const hydra = await CreateRentrypage(hydraText);

                const url = await CreateRentrypage(cleanedKeyword,newres);
                await sendMessage(chatId, messageId, 'Query : '+cleanedKeyword+'\n\nNo. of Results : '+total+'\n\nUrl : '+url, username);
          } 
         }
          else {
         const   newqueryString = new URLSearchParams({
              apikey: authConfig.nzbhydra_apikey,
              t: 'search',
              q: cleanedKeyword
          }).toString();
            const hydrafetch = await fetch(`${authConfig.Nzb_hydra_Domain}/api?${newqueryString}`, {
              method: 'GET'
          });

          if (!hydrafetch.ok) {
              throw new Error("Search Response was not OK!\nTry after Sometime or check code!!");
          }

          const hydraBuffer = await hydrafetch.arrayBuffer(); // Fetch the response as ArrayBuffer
          const hydraText = new TextDecoder("utf-8").decode(hydraBuffer); 

          const items = hydraText.match(/<item>[\s\S]*?<\/item>/g);
          const regex = /total="(\d+)"/;

          // Execute the regular expression on the XML string
          const match = regex.exec(hydraText) 
          const total = match ? match[1] : 0; // Handling the case when match is null

          const newres = [];
          if (!items || items.length === 0){
          await sendMessage(chatId, messageId, 'No results found!'+total);

         }else { 
          for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const title = item.match(/<title>(.*?)<\/title>/)[1];
              const size = item.match(/<newznab:attr name="size" value="(.*?)"\/>/)[1];
              const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)[1];
              const nzbid = item.match(/<guid isPermaLink="false">(.*?)<\/guid>/)[1];
              const regex = /total="(\d+)"/;

              // Execute the regular expression on the XML string
              const match = regex.exec(hydraText)
              const total = match[1];

              // Calculate the time difference 
              const daysAgo = getTimeDifference(new Date(pubDate));

              const itemParagraph = {
                tag: "p",
                attrs: {
                    dir: "auto"
                },
                children: [
                    {
                        tag: "strong",
                        children: [`○ ${title}`] 
                    },
                    "\n",
                    {
                        tag: "blockquote",
                        children: [`ID: ${nzbid}`]
                    },
                    "",
                    {
                        tag: "blockquote",
                        attrs: {
                            style: "color: blue;"
                        },
                        children: [`Size: ${formatFileSize(size)}`]
                    },
                    "",
                    {
                        tag: "blockquote",
                        attrs: {
                            style: "color: green;"
                        },
                        children: [`Age: ${daysAgo}`]
                    }
                ]
            };
            
            
              newres.push(itemParagraph);
          } 
       //  const hydra = await CreateRentrypage(hydraText);

          const url = await createGraphPage(cleanedKeyword,newres);
     const messdata =  await sendMessage(chatId, messageId, 'Query : '+cleanedKeyword+'\n\nNo. of Results : '+total+'\n\nUrl : '+url, username);
       /*   await new Promise(resolve => setTimeout(async () => {
            const data = await fetch(`https://api.telegram.org/bot${authConfig.bot_token}/deleteMessage?chat_id=${chatId}&message_id=${messdata.result.message_id}`);
            resolve(); 
        }, 50000));  */
   
   
        } 
          //  await sendMessage(chatId, messageId, 'Graph System not yet');

          }
        }
          catch (error) {
                console.error(error); // Log the error for debugging
                await sendMessage(chatId, messageId, error.message);
            }
        }
    }/*else if (messageText.startsWith('/indexers') && authConfig.sudo_users_ids == UserID) {
      const hydraindex = await fetch('https://example.com/nzbhydra/api/stats/?apikey=24T');
      if (!hydraindex.ok) {
          await sendMessage(chatId, messageId, 'Error Retrieving Index Lists!', username);
      } else {
          const indexjson = await hydraindex.json(); 
          const indexerStats = indexjson.indexerApiAccessStats;
  
          // Constructing the message
          let message = 'List of added Indexers:-\n\n';
          indexerStats.forEach(indexer => {
              message += `Name: <b>${indexer.indexerName}</b>\n`;
              message += `Success Percent: <b>${indexer.percentSuccessful}%</b>\n`;
              message += `Connection Error : <b>${indexer.percentConnectionError}</b>\n`;
              message += `Average Access: <b>${indexer.averageAccessesPerDay}</b>\n\n`;
          });
   
          // Sending the message 
          const messdata = await sendMessage(chatId, messageId, message, username);
          await new Promise(resolve => setInterval(async () => {
await sendMessage(chatId,message,'hi',username)
            resolve(); 
        }, 10000));
          // Using async/await with setTimeout to delete the message after 10 seconds
    // await  odeleteMessage(chatId,messdata.result.message_id,1)
  
      }
  }*/else if(messageText.startsWith('/status') && authConfig.authorised_chat_id == chatId){
    await handleStatusCommand(messageText,chatId,messageId,username)
  }
  else if (messageText.startsWith('/grab') && authConfig.authorised_chat_id == chatId) {
    const keywords = messageText.split(' ').slice(1); // Split the message text by spaces
    try {
        if (keywords.length === 0) {
            // Check if file ID is available in the replied message
            const replyMessage = data.message.reply_to_message;
            if (replyMessage && replyMessage.document && replyMessage.document.file_id) {
                const fileId = replyMessage.document.file_id;
                const filepathResponse = await fetch('https://api.telegram.org/bot'+authConfig.bot_token+'/getFile?file_id='+fileId);
                if (!filepathResponse.ok) {
                    throw new Error('Failed to fetch file path');
                }
                const filepathJson = await filepathResponse.json();
                const filepath = 'https://api.telegram.org/file/bot' + authConfig.bot_token + '/' + filepathJson.result.file_path;
                const addResponse = await fetch('https://vps.dhakrey.in/sabnzbd/api?mode=addurl&output=json&apikey=e20e6402637141dcb82bb2fd0e416bd3&name=' + encodeURIComponent(filepath) + '&nzbname=' + encodeURIComponent(replyMessage.document.file_name));
                if (!addResponse.ok) {
                    throw new Error('Failed to add file to SabNZBd');
                }
                const addres = await addResponse.json();
                await sendMessage(chatId, messageId, "No IDs provided!\n\nFile ID: " + fileId + '\n\nFile Path : ' + filepathJson.result.file_path + '\n\nRes From Sab : ' + JSON.stringify(addres), username);
            } else {
                await sendMessage(chatId, messageId, "No IDs provided and no file attached!", username);
            }
        } else {
            let filesAdded = 0; // Counter for files added
            for (const keyword of keywords) {
                const addResponse = await fetch('https://vps.dhakrey.in/sabnzbd/api?mode=addurl&output=json&apikey=e3&name=https://vps.dhakrey.in/nzbhydra/getnzb/api/' + encodeURIComponent(keyword) + '?apikey=2');
                if (!addResponse.ok) {
                    throw new Error('Failed to add file to SabNZBd');
                }
                const addres = await addResponse.json();
                if (addres.status === true) {
                    filesAdded++;
                }
            }
            await sendMessage(chatId, messageId, `${filesAdded} file(s) added to the queue`, username);
        }
    } catch (error) {
        console.error('Error occurred:', error);
        await sendMessage(chatId, messageId, 'An error occurred. Please try again later.\n\n'+error, username);
    }
}



    else {
      //  await sendMessage(chatId, messageId, "Not an Authorised Chat", username);
         }
    }
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("An error occurred.", { status: 500 });
  }
}

async function odeleteMessage(chatId,messageId,timeoutInMinutes) {
  // Wait for the specified timeout duration
  const timeoutInMilliseconds = timeoutInMinutes * 60 * 1000;
 
  await new Promise(resolve => setTimeout(async () => {
      // Delete the message
      const response = await fetch(`https://api.telegram.org/bot${authConfig.bot_token}/deleteMessage?chat_id=${chatId}&message_id=${messageId}`);
      resolve(response);
  }, timeoutInMilliseconds)); // Convert seconds to milliseconds
}
  

function filledBlocks(percentage) {
  const filledBlockCount = Math.floor(percentage / 10);
  const emptyBlockCount = 10 - filledBlockCount;
  return '▰'.repeat(filledBlockCount) + '▱'.repeat(emptyBlockCount);
}

function formatFileSize(bytes) {
  if (bytes == 0) return '0 Bytes';
  const k = 1024; 
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function sendMessage(chatID, replyID, messageText, username, inlineButtons = null) {
  try {
    const requestBody = {
      chat_id: chatID,
     reply_to_message_id: replyID,
      text: `${messageText}`,
      parse_mode: 'HTML'
    };

    if (inlineButtons) {
      requestBody.reply_markup = JSON.stringify({
        inline_keyboard: inlineButtons
      });
    }

    const sent = await fetch('https://api.telegram.org/bot' + authConfig.bot_token + '/sendMessage', {
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


async function CreateRentrypage(cleanedKeyword,text) {
  try {
      const url = 'https://rentry.co/';
      
      // Fetching the Rentry page
      const res = await fetch(url, {
          method: 'GET',
          headers: {
              'Referer': url
          }
      });

      if (!res.ok) {
          throw new Error('Failed to fetch Rentry page');
      }

      // Extracting CSRF token from the response
      const setCookieHeader = res.headers.get("set-cookie");
      const Cookie_csrfToken = setCookieHeader.match(/csrftoken=(.*?);/);
      
      if (!Cookie_csrfToken || !Cookie_csrfToken[1]) {
          throw new Error('Failed to get CSRF token from cookies');
      }

      const csrfToken = Cookie_csrfToken[1].replace("%3D", "=");

      const html = await res.text();
      const tokenRegex = /<input type="hidden" name="csrfmiddlewaretoken" value="(.+?)">/;
      const match = html.match(tokenRegex);
      const res_csrfToken = match ? match[1] : null;

      if (!res_csrfToken) {
          throw new Error('Failed to get CSRF token from response HTML');
      }
      const currentDate = new Date();
  
      // Extract day, month, and year
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = currentDate.getFullYear();
      const formattedDate = day +'.'+ month+'.' + year;

      // Creating payload with CSRF token and text
      const payload = new URLSearchParams();
      payload.append('csrfmiddlewaretoken', res_csrfToken);
      payload.append('text','##Search Results for  '+cleanedKeyword+' \n-> **PiratezParty Usenet Bot  |  '+formattedDate+'**  <- \n'+text);
      payload.append('edit_code', '');
      payload.append('url', '');

      // Posting data to Rentry
      const postResponse = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': 'csrftoken=' + csrfToken,
              'Referer': url
          },
          body: payload,
      });

      if (!postResponse.ok) {
          throw new Error('Failed to post data to Rentry');
      }

      const postText = await postResponse.text();
      const hrefRegex = /<link rel="canonical" href="(.+?)" \/>/;
      const hrefMatch = postText.match(hrefRegex);
      const href = hrefMatch ? hrefMatch[1] : null;

      if (!href) {
          throw new Error('Failed to extract Rentry URL');
      }

      return href;
  } catch (error) {
      console.error('Error:', error.message);
      return 'Error occurred';
  }
}

async function createGraphPage(cleanedKeyword,newres) {
  try {
      const formData = new FormData();
      formData.append('access_token', 'd3b25feccb89e508a9114afb82aa421fe2a9712b963b387cc5ad71e58722');
      formData.append('title', 'Search Results for ' + cleanedKeyword);
      formData.append('author_name', 'PiratezParty');
      formData.append('content', JSON.stringify(newres));
      formData.append('return_content', 'true');

      const response = await fetch('https://api.graph.org/createPage', {
          method: 'POST',
          body: formData
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error('Error Creating Graph Page: ' + data.error);
      }

      return data.result.url;
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}


/*async function updateQueueMessage(chatId, messageId) {
  try {
    const queue = await fetch(authConfig.sabNZB_Domain+'/api?mode=queue&output=json&apikey='+authConfig.sabNZB_apiKEY);
    const queueres = await queue.json();
    const slots = queueres.queue.slots.map(slot => {
      return {
        filename: slot.filename,
        status: slot.status,
        percentage: slot.percentage,
        mbLeft: slot.mbleft,
        sizeLeft: slot.sizeleft,
        eta: slot.eta,
        size: slot.size,
        nzbID: slot.nzo_id
      };
    });

    let message = "Current cv queue status:\n\n";

    if (slots.length === 0) {
      message += "No files in the queue.";
    } else {
      const slotsToShow = slots.slice(0, 10);
      slotsToShow.forEach(slot => {
        message += `<b>Filename</b>: ${slot.filename}\n`;
        message += `<b>${slot.percentage} %</b>   [ ${filledBlocks(slot.percentage)} ]\n`;
        message += `${slot.sizeLeft} remaining from ${slot.size}\n`;
        message += `<b>Status</b>: ${slot.status} | ETA: ${slot.eta}\n`;
        message += `ID: <code>${slot.nzbID}</code>\n\n`;
      });

      if (slots.length > 10) {
        const additionalSlotsCount = slots.length - 10;
        message += `+ ${additionalSlotsCount} more files in queue.\n`;
      }
    }

    const editFetch = await fetch('https://api.telegram.org/bot'+authConfig.bot_token+'/editMessageText', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: message,
        parse_mode: 'HTML'
      })
    });
const frew = await editFetch.json()
    
    if (editFetch.ok) {
   
    } else {
   
      return;
    }
 
  } catch (error) {
    console.error("Error updating queue message:", error);
  }
  
}*/

async function handleStatusCommand(messageText, chatId, messageId, usernaame) {
  const queue = await fetch(authConfig.sabNZB_Domain+'/api?mode=queue&output=json&apikey='+authConfig.sabNZB_apiKEY);
  const queueres = await queue.json();
  const slots = queueres.queue.slots.map(slot => {
      return {
          filename: slot.filename,
          status: slot.status,
          percentage: slot.percentage,
          mbLeft: slot.mbleft,
          sizeLeft: slot.sizeleft,
          eta: slot.eta,
          size:slot.size,
          nzbID:slot.nzo_id
      };
  });

  let message = "Current queue status:\n\n";

  if (slots.length === 0) {
      message += "No files in the queue.";
  } else {
      const slotsToShow = slots.slice(0, 10);
      slotsToShow.forEach(slot => {
          message += `<b>Filename</b> : ${slot.filename}\n`;
          message += `<b>${slot.percentage} %</b>   [ ${filledBlocks(slot.percentage)} ]\n`;
          message += `${slot.sizeLeft} remaining from ${slot.size}\n`;
          message += `<b>Status</b> : ${slot.status} | ETA : ${slot.eta}\n`;
          message += `ID : <code>${slot.nzbID}</code>\n\n`;
      });

      if (slots.length > 10) {
          const additionalSlotsCount = slots.length - 10;
          message += `+ ${additionalSlotsCount} more files in queue.\n`;
      }
  }

const data =  await sendMessage(chatId, messageId, message, usernaame); 
const newmesgID = data.result.message_id
const user = data.result.chat.id
 

/*async function periodicUpdateQueueMessage(chatId, messageId) {
  while (true) {
      await updateQueueMessage(chatId, newmesgID);
      // Wait for 5 seconds before the next update
      await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
  await periodicUpdateQueueMessage(chatId,newmesgID);*/
}

async function editMessage(chat_id,text,message_id){
  const editfetch = await fetch('https://api.telegram.org/bot'+authConfig.bot_token+'/editMessageText',{
    method:'POST',
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      chat_id:chat_id,
      message_id:message_id,
      text:text
    })
  })
}

// Function to calculate the time difference
function getTimeDifference(pubDate) {
  const currentDate = new Date();
  const publishedDate = new Date(pubDate);
  const timeDifference = currentDate.getTime() - publishedDate.getTime();
  const secondsDifference = Math.floor(timeDifference / 1000);

  if (secondsDifference < 60) {
      return secondsDifference + " second" + (secondsDifference === 1 ? '' : 's');
  } else {
      const minutesDifference = Math.floor(secondsDifference / 60);
      if (minutesDifference < 60) {
          return minutesDifference + " minute" + (minutesDifference === 1 ? '' : 's');
      } else {
          const hoursDifference = Math.floor(minutesDifference / 60);
          if (hoursDifference < 24) {
              return hoursDifference + " hour" + (hoursDifference === 1 ? '' : 's');
          } else {
              const daysDifference = Math.floor(hoursDifference / 24);
              return daysDifference + " day" + (daysDifference === 1 ? '' : 's');
          }
      }
  }
}
