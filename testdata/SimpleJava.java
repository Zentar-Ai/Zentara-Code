public class SimpleJava {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
            System.out.println("Current sum is: " + sum);
        }
        System.out.println("Final sum is: " + sum);
        try {
            int x = 1 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
    }
}