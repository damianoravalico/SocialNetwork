<template>
    <div class="mx-auto vh-100">
        <span>
            <h1 class="display-4">Message</h1>
        </span>
        <span>
            <UserBtn :user="this.user" />
        </span>
        <div class="bordered-top mt-3">
            <p class="mt-3" style="font-weight: 800;">
                {{ message.text }}
            </p>
            <div class="bordered-top">
                <p>
                    On {{ message.date.split("T")[0] }} at
                    {{ message.date.split("T")[1].split(":")[0] }}:{{ message.date.split("T")[1].split(":")[1] }}
                </p>
                <Like :message="message" @liked-event="reloadData" @unliked-event="reloadData"
                    @auth-event="showModal" />
            </div>
        </div>
        <AuthModal />
    </div>
</template>

<script>
import Like from "../components/Like.vue";
import AuthModal from "../components/AuthModal.vue";
import UserBtn from "../components/UserBtn.vue";

export default {
    data() {
        return {
            user: {},
            message: {}
        }
    },
    components: {
        Like,
        AuthModal,
        UserBtn
    },
    watch: {
        "$route.query": {
            handler(obj) {
                this.user = {};
                this.fetchUser(obj.userId);
                this.fetchMessage(obj.userId, obj.messageId);
            },
            immediate: true,
        }
    },
    methods: {
        async fetchUser(userId) {
            const res = await fetchApi("/social/users/" + userId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                let userJson = await res.json();
                this.user = userJson.user
            } else {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
        async fetchMessage(userId, messageId) {
            const res = await fetchApi("/social/messages/" + userId + "/" + messageId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                let messageJson = await res.json();
                this.message = messageJson.message;
            } else {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
        async reloadData() {
            await this.fetchMessage(this.user.id, this.message.id);
        },
        showModal() {
            this.$bvModal.show("no-auth")
        }
    }
}
</script>