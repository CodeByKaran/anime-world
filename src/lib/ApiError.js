
export class ApiError{
   constructor(
    message,
    success=true
   ){
      this.message = message;
      this.success = success;
   }
}