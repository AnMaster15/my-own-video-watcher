class apiError extends Error {
    constructor(
        message = 'Internal Server Error',
        statusCode ,
        stack = "",
        errors = []
    ) {
        super(message)
        this.statusCode = statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
    
}

export {apiError}