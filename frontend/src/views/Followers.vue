<template>
    <div class="vh-100">
        <h1 class="display-4">My followers</h1>
        <div class="pt-2" v-if="this.followersData.length !== 0">
            <div class="bordered-top" v-for="follower in followersData" :key="follower.id">
                <button class="blank-button w-100 text-left" @click="openUser(follower.id)">
                    <h3>{{ follower.name }} {{ follower.surname }}</h3>
                    <p style="font-size:large;">
                        @{{ follower.username }}
                    </p>
                </button>
            </div>
        </div>
        <div v-else class="bordered-top row justify-content-center pt-4">
            <p class="square centerd">No followers yet</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            followersData: [],
        }
    },
    beforeMount() {
        this.fetchFollowers();
    },
    methods: {
        async fetchFollowers() {
            const followersId = this.$store.getters.userState.user.followers;
            for (let index in followersId) {
                const res = await fetchApi("/social/users/" + followersId[index], {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (res.ok) {
                    let userJson = await res.json();
                    this.followersData.push(userJson.user);
                } else if (res.status !== 404) {
                    this.$router.push({ path: "/error" }).catch(() => { });
                }
            }
        },
        openUser(id) {
            this.$router.push({ path: "/user", query: { id: id } }).catch(() => { });
        }
    }
}
</script>
