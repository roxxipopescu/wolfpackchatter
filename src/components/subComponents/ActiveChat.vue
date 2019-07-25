<template>
    <div class="opened-chat">
        <i class="fa fa-chevron-left" v-on:click="exitChat(openedChatIndex)"></i>
        <div class="chat-title">{{openedChat.name}}</div>
        <div class="chat-body"> 
            <div class="messages">
                <div v-for="(msg, index) in messagesByChat" :key="index" class="msg-bubble">
                <div class="msg-data" :class="msg.user == username ? 'right':''">
                    <div class="userName">{{msg.user}}</div> 
                    <div class="sentMsg">{{msg.message}}</div>
                </div>
                </div>
            </div>
            <form @submit.prevent="sendMessage">
                <div class="msg-input input-group">
                    <input type="text" class="msg-inputfield form-control" v-model="message" :placeholder="typeTxt" />
                    <button class="send-msg btn btn-dark" type="submit">{{sendTxt}}</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client';
import "font-awesome/css/font-awesome.css";
import {eventBus} from "../../main";
import ChatService from "../../services/chatStorage.service";

export default {

    data: function() {
        return {
            socket: io('localhost:3000'),
            message: "",
            typeTxt: "Type a message",
            sendTxt: "Send",
            messages: [],
            messagesByChat: [],
        }
    },

    props:{
      openedChat: Object,     
      leafletMap: Object,
      openedChatIndex: Number,
      markerList: Array,   
      username: String
    },

    mounted: function(){  
        
        this.retrieveStoredChats(this.openedChatIndex);
        this.socket.emit('join', this.username);
        this.socket.on('message', (data) => { 
            this.messages = [...this.messages, data]; 
            ChatService.saveMessage('storedMessages', this.messages);
            this.messagesByChat =  this.filterMessagesByChat(this.openedChatIndex);
        });
    },

    updated(){
        if(this.$el.querySelector('.messages')){ 
            this.$el.querySelector('.messages').scrollTop  = this.$el.querySelector('.messages').scrollHeight;
        }
    },

    methods:{

        retrieveStoredChats(index){
            if (this.messages.length == 0 && ChatService.fetchAllMessages('storedMessages') !== null){ 
                this.messages = JSON.parse(ChatService.fetchAllMessages('storedMessages')); 
            }
            this.messagesByChat =  this.filterMessagesByChat(index);
        },

        filterMessagesByChat(index){
            return this.messages.filter((msg) => {
                if(msg.chatId ==  index) return msg;
            });
        },

        sendMessage(){
            this.socket.emit('message', this.message, this.openedChatIndex);
            this.message = ''
        },

        exitChat(index){
            this.leafletMap.removeLayer(this.markerList[index]);
            eventBus.$emit('LEAVE_CHAT', {'showChatList': true, 'activeChat': false});     
        },
    }
    
}
</script>
<style lang="sass" scoped>
    @import "../../scss/activeChat"
</style>
