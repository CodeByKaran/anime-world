
export class ApiResponse{
   constructor(
    message,
    data=[],
    success=true
   ){
      this.message = message;
      this.data = data;
      this.success = success;
   }
}