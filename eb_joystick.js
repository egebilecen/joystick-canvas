function New_Joystick()
{
    var EB_Joystick = {
        _init  : 0,
        status : {
            mousedown : false,
            holdingcircle : false
        },
    
        // Public Functions
        init : function(canvas, x, y, width)
        {
            if(this._init) return;
    
            this.canvas = {
                ctx    : canvas.getContext("2d"),
                width  : canvas.width,
                height : canvas.height
            };
    
            this.joystick = {
                outer_circle : {
                    width : width,
                    r : width / 2,
                    x : x,
                    y : y
                },
                inner_circle : {
                    width : width / 6,
                    r : width / 6 / 2,
                    x : x,
                    y : y
                },
                value_range : {
                    min : -100,
                    max :  100
                }
            }
    
            canvas.addEventListener("mousedown", function(e){
                var x = e.layerX;
                var y = e.layerY;
                    
                if(EB_Joystick.isTouchingToController(x, y))
                    EB_Joystick.status.holdingcircle = true;
                
                EB_Joystick.status.mousedown = true;
            });
    
            canvas.addEventListener("mouseup", function(e){
                EB_Joystick.status.holdingcircle = false;
                EB_Joystick.status.mousedown     = false;
    
                EB_Joystick.joystick.inner_circle.x = EB_Joystick.joystick.outer_circle.x;
                EB_Joystick.joystick.inner_circle.y = EB_Joystick.joystick.outer_circle.y;
            });
    
            canvas.addEventListener("mousemove", function(e){
                if(EB_Joystick.status.mousedown && EB_Joystick.status.holdingcircle)
                {
                    var x = e.layerX;
                    var y = e.layerY;
    
                    if(EB_Joystick.distanceBetweenTwoCoords(
                        {x:EB_Joystick.joystick.outer_circle.x, y:EB_Joystick.joystick.outer_circle.y},
                        {x:x, y:y}
                    ) > EB_Joystick.joystick.outer_circle.r)
                    {
                        var radian = Math.atan2(EB_Joystick.joystick.outer_circle.y - y, EB_Joystick.joystick.outer_circle.x - x);
                        
                        var sin    = Math.sin(radian);
                        var cos    = Math.cos(radian);
                        
                        x = parseInt(EB_Joystick.joystick.outer_circle.x + (EB_Joystick.joystick.outer_circle.r * cos * -1));
                        y = parseInt(EB_Joystick.joystick.outer_circle.y + (EB_Joystick.joystick.outer_circle.r * sin * -1));
                    }
    
                    EB_Joystick.joystick.inner_circle.x = x;
                    EB_Joystick.joystick.inner_circle.y = y;
                }
            });
    
            this._init = 1;
            
            return this;
        },
    
        setValueRange : function(min, max)
        {
            this.joystick.value_range.min = min;
            this.joystick.value_range.max = max;
        },
    
        getValues : function()
        {
            var ret_x =  this.valueMap(
                this.joystick.inner_circle.x, 
                this.joystick.outer_circle.x - this.joystick.outer_circle.r, this.joystick.outer_circle.x + this.joystick.outer_circle.r, 
                this.joystick.value_range.min, this.joystick.value_range.max);
            var ret_y = -this.valueMap(
                this.joystick.inner_circle.y, 
                this.joystick.outer_circle.y - this.joystick.outer_circle.r, this.joystick.outer_circle.y + this.joystick.outer_circle.r, 
                this.joystick.value_range.min, this.joystick.value_range.max);
    
            return {x: parseInt(ret_x), y: parseInt(ret_y)}
        },
        
        draw : function()
        {
            this.drawJoystick();
        },
    
        // Private Functions
        drawJoystick : function()
        {
            // Outer circle
            this.canvas.ctx.beginPath();
            this.canvas.ctx.lineWidth = 4;
            this.canvas.ctx.arc(this.joystick.outer_circle.x, this.joystick.outer_circle.y,
                                this.joystick.outer_circle.width / 2, 
                                0, 2*Math.PI);
            this.canvas.ctx.stroke();
            this.canvas.ctx.closePath();
    
            // Inner circle
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(this.joystick.inner_circle.x, this.joystick.inner_circle.y,
                                this.joystick.inner_circle.width, 
                                0, 2*Math.PI);
            this.canvas.ctx.fill();
            this.canvas.ctx.closePath();
        },
    
        isTouchingToController : function(x, y)
        {
            var dist = this.distanceBetweenTwoCoords({x:x, y:y}, {x:this.joystick.inner_circle.x, y:this.joystick.inner_circle.y});
    
            if(dist <= this.joystick.inner_circle.width) return true;
    
            return false;
        },
    
        distanceBetweenTwoCoords : function(coord1, coord2)
        {
            return Math.sqrt(((coord2.x - coord1.x) * (coord2.x - coord1.x)) + ((coord2.y - coord1.y) * (coord2.y - coord1.y)));
        },
    
        valueMap : function(val, in_min, in_max, out_min, out_max)
        {
            if (val < in_min || val > in_max)
            {
                console.log("[EB_Joystick | Error in valueMap()] - Value is out of range. (min: "+in_min+", max:"+in_max+", value:"+val+")");
                return NaN;
            }
    
            return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }
    }

    return EB_Joystick;
}
