<template>
    <div class="w-75 mx-auto">
        <h1 class="display-4">Sign in</h1>
        <b-form @submit.prevent="onSubmit">
            <b-form-group label="Enter your username">
                <b-form-input id="username" class="mb-1" v-model="form.username" placeholder="Username"></b-form-input>
            </b-form-group>

            <b-form-group label="Enter your password">
                <b-form-input id="password" type="password" class="mb-1" v-model="form.password"
                    placeholder="Password"></b-form-input>
            </b-form-group>

            <button type="submit" class="btn btn-primary w-100" :disabled="!isComplete">Sign in</button>

            <div class="mt-2">
                <div v-for="(error, index) in errors" :key="index" v-show="errors.length !== 0">
                    <small id="passwordError" class="block text-danger">
                        {{ error }}
                    </small>
                </div>
            </div>
        </b-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                username: "",
                password: "",
            },
            errors: [],
        }
    },
    computed: {
        isComplete() {
            if (this.form.username === "" || this.form.password === "") {
                return false;
            }
            return true;
        }
    },
    methods: {
        async onSubmit() {
            const body = {
                "username": this.form.username,
                "password": this.form.password
            }
            for (let element in body) {
                document.getElementById(element).classList.remove("is-invalid");
            }
            const res = await fetchApi("/auth/signin", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });
            this.errors = [];
            if (res.ok) {
                this.$router.replace({ path: "/" });
            } else if (res.status === 400) {
                const errorsJson = await res.json();
                const errors = errorsJson.error;
                const errorsLog = [];
                for (let i in errors) {
                    document.getElementById(errors[i].param).classList.add("is-invalid");
                    errorsLog.push(errors[i].msg);
                }
                this.errors = errorsLog;
            } else if (res.status === 404) {
                const error = await res.json();
                this.errors.push(error.error);
            } else if (res.status === 403) {
                const error = await res.json();
                this.errors.push(error.error);
            } else {
                this.$router.push({ path: "/error" }).catch(() => { });
            }
        },
    }
}
</script>