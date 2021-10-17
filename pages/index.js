import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 25,
  width: 25,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  Food: "food",
  Empty: "empty",
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

const Cell = ({ x, y, type }) => {
  const getStyles = () => {
    switch (type) {
      case CellType.Snake:
        return {
          backgroundColor: "yellowgreen",
          borderRadius: 8,
          padding: 2,
        };

      case CellType.Food:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };

      default:
        return {};
    }
  };
  return (
    <div
      className={styles.cellContainer}
      style={{
        left: x * Config.cellSize,
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
});

const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [food, setFood] = useState([{ x: 4, y: 10 }]);
  const [score, setScore] = useState(0);



  
  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        
        const tails = [
          ...snake
        ]
        
        tails.shift();
        let newHead = { x: head.x + direction.x, y: head.y + direction.y };
        if(newHead.x > Config.width - 1) newHead = { x: 0, y: newHead.y }
        if(newHead.x < 0) newHead = { x: Config.width - 1, y: newHead.y }
        if(newHead.y > Config.height - 1) newHead = { x: newHead.x, y: 0 }
        if(newHead.y < 0) newHead = { x: newHead.x, y: Config.width - 1 }
        
        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];
        
        // remove tail
        newSnake.pop();


        // check if snake head is equal to it's any tail
        if(tails.find(tail => tail.x === newHead.x && tail.y === newHead.y)){
          alert("Game over")
          setScore(0)
          setDirection(Direction.Right)
          let newFood = getRandomCell();
          while (isSnake(newFood)) {
            newFood = getRandomCell();
          }
    
          setFood([...newFood]);
          return getDefaultSnake()
        } else {
          return newSnake;
        }


      });
      

    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 400);

    return () => clearInterval(timer);
  }, [direction, food]);

  

  // update score and snake tail whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      setScore((score) => {
        return score + 1;
      });

      let newFood = getRandomCell();
      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }

      setFood([{x: newFood.x, y: newFood.y}]);

      // increase snake size by adding tails
      setSnake((prevSnake) =>{
        return [
          ...prevSnake, {
            x: prevSnake.at(-1).x + direction.x, y: prevSnake.at(-1).y + direction.y
          }
        ]
      } )
    }
  }, [snake]);

  // console.log(food);
  //udate food in every 3 seconds
  useEffect(() => {
    const genFood = () => {
      let newFood = getRandomCell();
      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }

      setFood((prevFood) => [...prevFood, {x: newFood.x , y: newFood.y}]);
      
    }
    genFood(); 
    const timer = setInterval(genFood, 3000);

    
    return () => {
      clearInterval(timer)
    }
    
    
  }, [])


    // setInterval(() => {
    //   setFood((prevFood) => {
        
    //     const newFood = prevFood.pop()
    //     console.log(newFood);
    //     return [{x: 11, y:17}]
    //   })
    // }, 10000);

 

  


  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          
          setDirection((prevDirection)=> {
            if(prevDirection.x === Direction.Bottom.x && prevDirection.y === Direction.Bottom.y){
              return prevDirection;
            } else {
              return {
                x: Direction.Top.x,
                y: Direction.Top.y
              }
            }
          });

          break;
          
          case "ArrowDown":
            setDirection((prevDirection)=> {
              if(prevDirection.x === Direction.Top.x && prevDirection.y === Direction.Top.y){
                return prevDirection;
              } else {
                return {
                  x: Direction.Bottom.x,
                  y: Direction.Bottom.y
                }
              }
            });
     
            break;
            
            case "ArrowLeft":
              setDirection((prevDirection)=> {
                if(prevDirection.x === Direction.Right.x && prevDirection.y === Direction.Right.y){
                  return prevDirection;
                } else {
                  return {
                    x: Direction.Left.x,
                    y: Direction.Left.y
                  }
                }
              });
              
              break;
              
              case "ArrowRight":
                setDirection((prevDirection)=> {
                  if(prevDirection.x === Direction.Left.x && prevDirection.y === Direction.Left.y){
                    return prevDirection;
                  } else {
                    return {
                      x: Direction.Right.x,
                      y: Direction.Right.y
                    }
                  }
                });
                
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => food?.find(food => food.x === x && food.y === y);

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);

  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty;
      if (isFood({ x, y })) {
        type = CellType.Food;
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      }
      cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
    }
  }
  
  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ width: Config.width * Config.cellSize }}
      >
        Score: {score}
      </div>
      <div
        className={styles.grid}
        style={{
          height: Config.height * Config.cellSize,
          width: Config.width * Config.cellSize,
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
