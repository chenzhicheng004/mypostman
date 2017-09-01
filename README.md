
这是一个java后端开发项目时自测controller层接口的小工具，要能使用该工具，需要项目具备一定条件：

1、controller层的java类有@Controller标记

2、controller类的每一个接口方法有@RequestMapping标记

3、controller类的每一个接口方法中，获取前端请求参数的方式是通过springmvc自动设置到接口方法的参数中，
而不是通过request.getParameter()的方式



使用步骤：

1、安装node

2、在项目根目录下执行 npm install(安装node依赖包)

3、在后端项目的根目录下执行 PORT=xxx node ...../index.js(前面的参数是访问本项目的端口，后面的参数是项目根目录的绝对路径，也可以使用相对路径)

4、访问localhost:xxx/index







