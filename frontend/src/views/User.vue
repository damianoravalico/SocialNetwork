<template>
    <div class="mx-auto vh-100">
        <span>
            <h1 class="display-4">{{ this.user.name }} {{ this.user.surname }}</h1>
            <div class="container">
                <div class="row">
                    <div class="col-xs-6 w-25">
                        <h3>@{{ this.user.username }}</h3>
                    </div>
                    <div class="col-xs-6">
                        <div v-if="this.$store.getters.isAuthenticated">
                            <div v-if="this.$store.getters.userState.user.id != this.user.id">
                                <div v-if="this.$store.getters.userState.user.following.includes(this.user.id)">
                                    <button class="btn btn-primary mb-1" @click="unfollowUser">Unfollow</button>
                                </div>
                                <div v-else>
                                    <button class="btn btn-primary mb-1" @click="followUser">Follow</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h6 class="mt-2 font-italic">{{ this.user.bio }}</h6>
        </span>
        <div id="message-div" :key="componentKey">
            <div class="pt-2" v-if="!isEmpty">
                <div class="bordered-top" v-for="message in messages" :key="message.id">
                    <button class="blank-button w-100 text-left" @click="openMessage(message.idCreator, message.id)">
                        <p>On {{ message.date.split("T")[0] }} said</p>
                        <p class="ml-3" style="font-weight: 600;">{{ message.text }}</p>
                        <Like :message="message" @liked-event="reloadData" @unliked-event="reloadData"
                            @auth-event="showModal" />
                    </button>
                </div>
            </div>
            <div v-else class="bordered-top row justify-content-center pt-4">
                <p class="square centerd">No messages yet</p>
            </div>
        </div>
        <AuthModal />
    </div>
</template>

<script>
import Like from "../components/Like.vue";
import AuthModal from "../components/AuthModal.vue";

export default {
    data() {
        return {
            isEmpty: true,
            user: {},
            messages: [],
            componentKey: 0,
        }
    },
    components: {
        Like,
        AuthModal
    },
    watch: {
        "$route.query": {
            handler(obj) {
                this.isEmpty = true;
                this.user = {};
                this.messages = [];
                this.fetchUserData(obj.id);
                this.fetchUserMessages(obj.id);
            },
            immediate: true,
        },
    },
    methods: {
        async fetchUserData(id) {
            const url = "http://localhost:3000/api/social/users/" + id;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                let userJson = await res.json();
                this.user = userJson.user;
                let documentTitle = document.title.replace("User", "@" + this.user.username);
                document.title = documentTitle;
            } else if (res.status !== 404) {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
        async fetchUserMessages(id) {
            const url = "http://localhost:3000/api/social/messages/" + id;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                let messagesJson = await res.json();
                this.messages = messagesJson.messages.reverse();
                this.isEmpty = false;
            } else if (res.status === 404) {
                this.isEmpty = true;
            } else if (res.status !== 404) {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
        openMessage(userId, messageId) {
            const pathTo = "/message";
            if (this.$route.name != pathTo) {
                this.$router.push({ path: pathTo, query: { userId: userId, messageId: messageId } }).catch(() => { });
            }
        },
        async followUser() {
            const url = "http://localhost:3000/api/social/followers/" + this.user.id;
            const res = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                await this.$store.dispatch("verifyAuthentication");
            } else if (res.status === 404) {
                this.isEmpty = true;
            } else if (res.status !== 404) {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
        async unfollowUser() {
            const url = "http://localhost:3000/api/social/followers/" + this.user.id;
            const res = await fetch(url, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                await this.$store.dispatch("verifyAuthentication");
            } else if (res.status === 404) {
                this.isEmpty = true;
            } else if (res.status !== 404) {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
        async reloadData() {
            await this.fetchUserMessages(this.user.id);
        },
        showModal() {
            this.$bvModal.show("no-auth")
        }
    }
}
</script>